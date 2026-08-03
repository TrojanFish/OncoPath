from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceCreate, EvidenceResponse

router = APIRouter()

@router.get("/search", response_model=List[EvidenceResponse])
async def search_evidence(q: str, db: AsyncSession = Depends(get_db)):
    """
    Mock retrieval API that performs a keyword search against the database.
    (This will be replaced by pgvector embedding search in the future)
    """
    query = select(Evidence).where(
        (Evidence.keywords.ilike(f"%{q}%")) | 
        (Evidence.title.ilike(f"%{q}%")) |
        (Evidence.summary.ilike(f"%{q}%"))
    )
    result = await db.execute(query)
    evidences = result.scalars().all()
    return evidences

@router.post("/seed", response_model=List[EvidenceResponse])
async def seed_evidence(db: AsyncSession = Depends(get_db)):
    """
    Internal endpoint to quickly seed the database with mock mGGO/STAS medical papers.
    """
    mock_papers = [
        Evidence(
            title="Prognostic impact of spread through air spaces (STAS) in lung adenocarcinoma",
            journal="Chest",
            year=2021,
            authors="Smith J, et al.",
            summary="In this meta-analysis of 25,467 patients, STAS negativity was associated with significantly lower recurrence risk.",
            conclusion="STAS negative status is a strong favorable prognostic factor in early-stage lung adenocarcinoma.",
            keywords="STAS, lung adenocarcinoma, prognosis, recurrence"
        ),
        Evidence(
            title="Consolidation-to-tumor ratio (CTR) as a predictor of survival in ground-glass opacity (GGO) lung cancer",
            journal="J Thorac Oncol",
            year=2021,
            authors="Yamaguchi M, et al.",
            summary="The JCOG0804 prospective study confirmed that patients with CTR ≤ 0.25 had a 5-year RFS of 99.7%.",
            conclusion="Low CTR is highly predictive of excellent survival outcomes and supports sublobar resection safety.",
            keywords="CTR, GGO, Consolidation-to-tumor ratio, survival, JCOG0804"
        ),
        Evidence(
            title="IASLC Grading System for Invasive Pulmonary Adenocarcinoma",
            journal="J Clin Oncol",
            year=2020,
            authors="Moreira AL, et al.",
            summary="A novel grading system proposed by IASLC effectively stratifies patients into three prognostic groups based on predominant histologic patterns.",
            conclusion="The 2020 IASLC grading system is superior to conventional differentiation grading for predicting recurrence and survival.",
            keywords="IASLC, grading, histology, adenocarcinoma"
        )
    ]
    
    # Check if already seeded
    existing = await db.execute(select(Evidence).limit(1))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Database already seeded with mock evidence")
    
    db.add_all(mock_papers)
    await db.commit()
    
    # Refresh objects to get IDs
    for paper in mock_papers:
        await db.refresh(paper)
        
    return mock_papers
