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
    created_at = Column(DateTime, default=datetime.utcnow)
