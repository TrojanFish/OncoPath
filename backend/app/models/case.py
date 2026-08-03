from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class PatientCase(Base):
    __tablename__ = "patient_cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Core Demographics
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    surgery_type = Column(String, nullable=True)
    
    # AI Report Result
    report_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    tumors = relationship("Tumor", back_populates="patient_case", cascade="all, delete-orphan")

class Tumor(Base):
    __tablename__ = "tumors"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, ForeignKey("patient_cases.id"), nullable=False)
    
    stage = Column(String, nullable=True)
    location = Column(String, nullable=True)
    tumor_size_mm = Column(Float, nullable=True)
    solid_size_mm = Column(Float, nullable=True)
    ctr = Column(Float, nullable=True)
    morphology = Column(String, nullable=True)
    
    patient_case = relationship("PatientCase", back_populates="tumors")
    pathology_features = relationship("PathologyFeature", back_populates="tumor", uselist=False, cascade="all, delete-orphan")

class PathologyFeature(Base):
    __tablename__ = "pathology_features"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tumor_id = Column(String, ForeignKey("tumors.id"), nullable=False)
    
    stas = Column(String, nullable=True)
    vpi = Column(String, nullable=True)
    lvi = Column(String, nullable=True)
    iaslc_grade = Column(String, nullable=True)
    margin = Column(String, nullable=True)
    lymph_nodes = Column(String, nullable=True)
    egfr = Column(String, nullable=True)
    
    tumor = relationship("Tumor", back_populates="pathology_features")
