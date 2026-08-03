from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.models.case import PatientCase
from app.models.user import User
from app.schemas.case import PatientCaseResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[PatientCaseResponse])
async def get_cases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all medical cases for the current user.
    """
    query = select(PatientCase).where(PatientCase.user_id == current_user.id).options(
        selectinload(PatientCase.tumors).selectinload(PatientCase.tumors.property.mapper.class_.pathology_features)
    ).order_by(PatientCase.created_at.desc())
    result = await db.execute(query)
    cases = result.scalars().all()
    return cases

@router.get("/{case_id}", response_model=PatientCaseResponse)
async def get_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a specific medical case by ID.
    """
    query = select(PatientCase).where(PatientCase.id == case_id, PatientCase.user_id == current_user.id).options(
        selectinload(PatientCase.tumors).selectinload(PatientCase.tumors.property.mapper.class_.pathology_features)
    )
    result = await db.execute(query)
    case = result.scalars().first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    return case
