from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional
import json

from app.core.database import get_db
from app.models.evidence import Evidence
from app.models.case import PatientCase, Tumor, PathologyFeature
from app.models.user import User
from app.services.agent import AnalysisAgent
from app.services.rules import MedicalRulesEngine
from app.services.vector_search import VectorSearchService
from app.api.deps import get_current_user

router = APIRouter()
agent = AnalysisAgent()

class PatientProfileInput(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    surgeryType: Optional[str] = None
    stage: Optional[str] = None
    iaslcGrade: Optional[str] = None
    morphology: Optional[str] = None
    ctr: Optional[float] = None
    solidSize: Optional[float] = None
    tumorSize: Optional[float] = None
    stas: Optional[str] = None
    lvi: Optional[str] = None
    vpi: Optional[str] = None
    lymphNodes: Optional[str] = None
    egfr: Optional[str] = None
    margin: Optional[str] = None

@router.post("/generate")
async def generate_analysis(
    profile: PatientProfileInput, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Step 1: Medical Rules Engine override
        # We strictly calculate TNM instead of trusting frontend or LLM
        if profile.tumorSize is not None or profile.solidSize is not None:
            tnm = MedicalRulesEngine.calculate_tnm(
                tumor_size_cm=profile.tumorSize,
                solid_size_cm=profile.solidSize,
                nodes=profile.lymphNodes or "N0"
            )
            # Overwrite stage with computed stage for safety
            profile.stage = tnm["stage"]

        # Step 2: Build a semantic search query from the patient profile.
        # A natural-language description retrieves semantically related
        # evidence far better than exact keyword matching (e.g. "air space
        # spread" matches "STAS", Chinese morphology matches English titles).
        query_parts = []
        if profile.stage:
            query_parts.append(f"stage {profile.stage}")
        if profile.stas == "阳性":
            query_parts.append("STAS spread through air spaces")
        if profile.ctr is not None:
            query_parts.append(f"consolidation tumor ratio CTR {profile.ctr}")
        if profile.iaslcGrade:
            query_parts.append(f"IASLC grade {profile.iaslcGrade}")
        if profile.morphology:
            query_parts.append(profile.morphology)
        if profile.lymphNodes:
            query_parts.append(f"lymph node {profile.lymphNodes}")
        if profile.egfr:
            query_parts.append(f"EGFR {profile.egfr}")
        if not query_parts:
            query_parts.append("lung adenocarcinoma early stage prognosis")
        semantic_query = " ".join(query_parts)

        # Step 3: Retrieve evidence via semantic (vector) search.
        # VectorSearchService degrades to keyword ILIKE automatically when no
        # embeddings / no API key is available.
        search_service = VectorSearchService(db)
        retrieved_evidences = await search_service.search_evidence(semantic_query, limit=5)
                    
        # Step 4: Call LLM Agent
        profile_dict = profile.model_dump(exclude_none=True)
        raw_report = await agent.generate_report(profile_dict, retrieved_evidences)
        
        # Step 5: Parse JSON and Save to Database
        try:
            cleaned = raw_report.strip()
            if cleaned.startswith("```json"): cleaned = cleaned[7:]
            if cleaned.startswith("```"): cleaned = cleaned[3:]
            if cleaned.endswith("```"): cleaned = cleaned[:-3]
            report_json = json.loads(cleaned.strip())
            
            # Save Patient Case Hierarchically
            new_case = PatientCase(
                user_id=current_user.id,
                age=profile.age,
                gender=profile.gender,
                surgery_type=profile.surgeryType,
                report_json=report_json
            )
            db.add(new_case)
            await db.flush() # get new_case.id
            
            new_tumor = Tumor(
                case_id=new_case.id,
                stage=profile.stage,
                location="Lung", # MVP default
                tumor_size_mm=profile.tumorSize,
                solid_size_mm=profile.solidSize,
                ctr=profile.ctr,
                morphology=profile.morphology
            )
            db.add(new_tumor)
            await db.flush()
            
            new_path = PathologyFeature(
                tumor_id=new_tumor.id,
                stas=profile.stas,
                vpi=profile.vpi,
                lvi=profile.lvi,
                iaslc_grade=profile.iaslcGrade,
                margin=profile.margin,
                lymph_nodes=profile.lymphNodes,
                egfr=profile.egfr
            )
            db.add(new_path)
            
            await db.commit()
            
            return report_json
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="LLM generated invalid JSON format")

    except Exception as e:
        print(f"Analysis error: {e}")
        if "Incorrect API key provided" in str(e) or "sk-mock-key" in str(e):
            return {
                "risk_level": "Mock LLM Error - Configure API Key",
                "key_findings": ["System detected STAS: " + str(profile.stas)],
                "evidence_summary": "Please add a real OPENAI_API_KEY to your .env file to unlock the full AI analysis.",
                "recommendations": ["Check backend logs"]
            }
        raise HTTPException(status_code=500, detail=str(e))
