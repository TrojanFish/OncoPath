"""Seed the evidence database from data/evidence_database.json.

Shared by the standalone script `backend/seed_evidence.py` and the
`/evidence/seed-real` API endpoint so both use identical field mapping.
"""
import json
from pathlib import Path
from typing import Any, Dict, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evidence import Evidence
from app.services.vector_search import VectorSearchService

# data/evidence_database.json lives at the repo root, one level up from backend/.
DATA_FILE = Path(__file__).resolve().parents[3] / "data" / "evidence_database.json"


def map_study_to_evidence(study: Dict[str, Any]) -> Dict[str, Any]:
    """Map a study record from evidence_database.json to Evidence fields."""
    key_conclusions: List[str] = study.get("key_conclusions", []) or []
    relevant_factors: List[str] = study.get("relevant_factors", []) or []
    pubmed_id = study.get("pubmed_id")
    doi = study.get("doi")

    # Source URL: prefer PubMed, fall back to DOI resolver.
    url = None
    if pubmed_id:
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pubmed_id}/"
    elif doi:
        url = f"https://doi.org/{doi}"

    # Summary: structured study metadata + conclusions (good embedding input).
    summary_parts = [
        f"Study type: {study.get('study_type', 'N/A')}",
        f"Evidence level: {study.get('evidence_level', 'N/A')}",
    ]
    if study.get("patient_n"):
        summary_parts.append(f"Patients: {study['patient_n']}")
    if study.get("applicable_stages"):
        summary_parts.append(f"Applicable stages: {', '.join(study['applicable_stages'])}")
    if relevant_factors:
        summary_parts.append(f"Relevant factors: {', '.join(relevant_factors)}")
    summary_parts.append("Key conclusions: " + " | ".join(key_conclusions))
    summary = "\n".join(summary_parts)

    conclusion = " ".join(key_conclusions) if key_conclusions else "See source publication"
    keywords = ", ".join(relevant_factors) if relevant_factors else study.get("id", "lung-cancer")
    authors = f"N/A (PubMed: {pubmed_id})" if pubmed_id else "N/A"

    return {
        "title": study["title"],
        "journal": study.get("journal", "Unknown"),
        "year": study.get("year", 0),
        "authors": authors,
        "summary": summary,
        "conclusion": conclusion,
        "keywords": keywords,
        "url": url,
        "patient_n": study.get("patient_n"),
        "study_type": study.get("study_type"),
    }


async def seed_real_evidence(db: AsyncSession) -> Dict[str, int]:
    """Load real studies from evidence_database.json into the DB.

    Idempotent: skips studies whose title already exists. Generates an
    embedding for each new row (zero-vector when no API key is configured).

    Returns a dict {total, added, skipped} for reporting.
    """
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    studies = data.get("studies", []) or []

    search_service = VectorSearchService(db)
    added = 0
    skipped = 0

    for study in studies:
        existing = await db.execute(select(Evidence).where(Evidence.title == study["title"]))
        if existing.scalars().first():
            skipped += 1
            continue

        fields = map_study_to_evidence(study)

        # Embed from the most informative text we have.
        embed_text = f"{fields['title']}\n{fields['summary']}"
        embedding = await search_service.get_embedding(embed_text)
        fields["embedding"] = json.dumps(embedding)

        db.add(Evidence(**fields))
        added += 1

    await db.commit()
    return {"total": len(studies), "added": added, "skipped": skipped}
