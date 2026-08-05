from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db, AsyncSessionLocal
from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceCreate, EvidenceResponse
from app.services.pubmed import fetch_pubmed_studies
from app.services.europe_pmc import fetch_europe_pmc_studies

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

async def process_pubmed_pipeline(query: str):
    """Background task to fetch and save pubmed studies."""
    studies = await fetch_pubmed_studies(query, max_results=5)
    if not studies:
        return
        
    async with AsyncSessionLocal() as db:
        for s in studies:
            # Check if exists by title
            exists = await db.execute(select(Evidence).where(Evidence.title == s["title"]))
            if exists.scalars().first():
                continue
                
            evidence = Evidence(
                title=s["title"],
                journal=s["journal"],
                year=s["year"],
                authors=s["authors"],
                summary=s["abstract"],
                conclusion="Pending AI Analysis",
                keywords="PubMed Auto-fetched"
            )
            db.add(evidence)
        await db.commit()

@router.post("/fetch-pubmed")
async def trigger_pubmed_fetch(background_tasks: BackgroundTasks, query: str = '("stage IA" OR "T1N0") AND "non-small cell lung cancer"'):
    """
    Triggers an automated pipeline to fetch new studies from PubMed.
    Runs asynchronously in the background.
    """
    background_tasks.add_task(process_pubmed_pipeline, query)
    return {"message": "PubMed fetch pipeline started in the background", "query": query}

async def process_europe_pmc_pipeline(query: str):
    """Background task to fetch and save studies from Europe PMC."""
    studies = await fetch_europe_pmc_studies(query, max_results=5)
    if not studies:
        return
        
    async with AsyncSessionLocal() as db:
        for s in studies:
            # Check if exists by title
            exists = await db.execute(select(Evidence).where(Evidence.title == s["title"]))
            if exists.scalars().first():
                continue
                
            evidence = Evidence(
                title=s["title"],
                journal=s["journal"],
                year=s["year"],
                authors=s["authors"],
                summary=s["abstract"],
                conclusion="Pending AI Analysis",
                keywords="EuropePMC Auto-fetched"
            )
            db.add(evidence)
        await db.commit()

@router.post("/fetch-europe-pmc")
async def trigger_europe_pmc_fetch(background_tasks: BackgroundTasks, query: str = '("stage IA" OR "T1N0") AND "non-small cell lung cancer"'):
    """
    Triggers an automated pipeline to fetch new studies from Europe PMC.
    Runs asynchronously in the background.
    """
    background_tasks.add_task(process_europe_pmc_pipeline, query)
    return {"message": "Europe PMC fetch pipeline started in the background", "query": query}

