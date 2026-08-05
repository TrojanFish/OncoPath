from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.evidence import Evidence
from app.models.case import PatientCase

router = APIRouter()

@router.get("/")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """
    Returns real statistics from the database.

    No inflated base values — the platform must be honest about its actual
    coverage. `total_patients` reflects the cumulative patient cohort across
    all indexed studies (sum of each evidence row's `patient_n`), and
    `total_rct` counts actual randomized controlled trials by study_type.
    """
    # Total indexed studies
    total_studies = await db.scalar(select(func.count()).select_from(Evidence)) or 0

    # Cumulative patient cohort covered by the indexed literature
    total_patients = await db.scalar(select(func.coalesce(func.sum(Evidence.patient_n), 0))) or 0

    # Meta-analyses (detected by title/summary keyword)
    total_meta_analysis = await db.scalar(
        select(func.count()).select_from(Evidence).where(
            Evidence.title.ilike("%meta%") | Evidence.summary.ilike("%meta%")
        )
    ) or 0

    # Real RCTs (by source study_type, not hardcoded)
    total_rct = await db.scalar(
        select(func.count()).select_from(Evidence).where(
            Evidence.study_type.ilike("%rct%")
        )
    ) or 0

    # Patient cases analyzed on this platform (real usage, not inflated)
    total_cases = await db.scalar(select(func.count()).select_from(PatientCase)) or 0

    return {
        "total_studies": total_studies,
        "total_patients": total_patients,
        "total_meta_analysis": total_meta_analysis,
        "total_rct": total_rct,
        "total_cases": total_cases,
    }
