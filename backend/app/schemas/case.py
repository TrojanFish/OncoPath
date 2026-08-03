from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime

class PathologyFeatureBase(BaseModel):
    stas: Optional[str] = None
    vpi: Optional[str] = None
    lvi: Optional[str] = None
    iaslc_grade: Optional[str] = None
    margin: Optional[str] = None
    lymph_nodes: Optional[str] = None
    egfr: Optional[str] = None

class PathologyFeatureResponse(PathologyFeatureBase):
    id: str

    class Config:
        from_attributes = True

class TumorBase(BaseModel):
    stage: Optional[str] = None
    location: Optional[str] = None
    tumor_size_mm: Optional[float] = None
    solid_size_mm: Optional[float] = None
    ctr: Optional[float] = None
    morphology: Optional[str] = None

class TumorResponse(TumorBase):
    id: str
    pathology_features: Optional[PathologyFeatureResponse] = None

    class Config:
        from_attributes = True

class PatientCaseBase(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    surgery_type: Optional[str] = None

class PatientCaseResponse(PatientCaseBase):
    id: str
    user_id: str
    report_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    tumors: List[TumorResponse] = []

    class Config:
        from_attributes = True
