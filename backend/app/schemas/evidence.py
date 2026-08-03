from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class EvidenceBase(BaseModel):
    title: str
    journal: str
    year: int
    authors: str
    summary: str
    conclusion: str
    keywords: str

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
