from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.models.case import PatientCase
from app.models.user import User
from app.schemas.case import PatientCaseResponse, PatientCaseCreate
from app.api.deps import get_current_user

router = APIRouter()

async def _get_case_with_relations(db: AsyncSession, case_id: str) -> PatientCase:
    """Reload a case with tumors + pathology features eagerly loaded.

    The response model accesses these relationships; lazy loading inside an
    async session raises a greenlet error, so we eager-load explicitly.
    """
    result = await db.execute(
        select(PatientCase).where(PatientCase.id == case_id).options(
            selectinload(PatientCase.tumors).selectinload(PatientCase.tumors.property.mapper.class_.pathology_features)
        )
    )
    return result.scalars().first()

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

@router.post("/", response_model=PatientCaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_in: PatientCaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually create a medical case (without running AI analysis)."""
    new_case = PatientCase(
        user_id=current_user.id,
        age=case_in.age,
        gender=case_in.gender,
        surgery_type=case_in.surgery_type,
    )
    db.add(new_case)
    await db.commit()
    return await _get_case_with_relations(db, new_case.id)

@router.put("/{case_id}", response_model=PatientCaseResponse)
async def update_case(
    case_id: str,
    case_in: PatientCaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a medical case's demographic fields (age / gender / surgery type)."""
    result = await db.execute(
        select(PatientCase).where(
            PatientCase.id == case_id,
            PatientCase.user_id == current_user.id,
        )
    )
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.age = case_in.age
    case.gender = case_in.gender
    case.surgery_type = case_in.surgery_type
    await db.commit()
    return await _get_case_with_relations(db, case_id)

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a medical case. Cascades to its tumors and pathology features."""
    result = await db.execute(
        select(PatientCase).where(
            PatientCase.id == case_id,
            PatientCase.user_id == current_user.id,
        )
    )
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    await db.delete(case)
    await db.commit()
    return None
