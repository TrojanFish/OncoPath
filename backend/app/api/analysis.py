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

        # Step 2: Rule-based translation of profile to search queries
        queries = []
        if profile.stas == "阳性":
            queries.append("STAS")
        if profile.ctr is not None and profile.ctr <= 0.5:
            queries.append("CTR")
        if profile.iaslcGrade:
            queries.append("IASLC")
            
        if not queries:
            queries.append("lung adenocarcinoma")

        # Step 3: Retrieve Evidence
        retrieved_evidences = []
        seen_ids = set()
        for q in queries:
            db_query = select(Evidence).where(
                (Evidence.keywords.ilike(f"%{q}%")) | 
                (Evidence.title.ilike(f"%{q}%"))
            )
            result = await db.execute(db_query)
            evidences = result.scalars().all()
            for e in evidences:
                if e.id not in seen_ids:
                    retrieved_evidences.append(e)
                    seen_ids.add(e.id)
                    
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
