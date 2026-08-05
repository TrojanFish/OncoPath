from sqlalchemy import Column, String, DateTime, Text, Integer
import uuid
from datetime import datetime
from app.core.database import Base

class Evidence(Base):
    __tablename__ = "evidences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    journal = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    authors = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    conclusion = Column(Text, nullable=False)
    keywords = Column(String, nullable=False) # Store comma separated keywords for MVP search
    # Optional source URL (PubMed / DOI link) for traceability
    url = Column(String, nullable=True)
    # Source study metadata — powers honest statistics (patient cohort size,
    # study type) instead of inflated hardcoded base values.
    patient_n = Column(Integer, nullable=True)
    study_type = Column(String, nullable=True)
    # Embedding stored as JSON-serialized float list (e.g. "[0.12, -0.03, ...]").
    # Using Text (instead of pgvector Vector) keeps it compatible with the
    # SQLite MVP AND PostgreSQL; similarity is computed in application layer
    # (see app.services.vector_search). Migrating to a native pgvector column
    # is a follow-up optimization once the RAG path is proven.
    embedding = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
