"""Standalone script to seed the evidence DB from data/evidence_database.json.

Run from the backend/ directory:
    python seed_evidence.py

Creates tables if missing, then loads the 9 real studies (with embeddings
when an OpenAI key is configured, zero-vectors otherwise). Idempotent.
"""
import asyncio

from app.core.database import AsyncSessionLocal, engine, Base
from app.services.seeding import seed_real_evidence


async def main():
    # Ensure tables exist (incl. the new embedding / url columns on SQLite MVP).
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        result = await seed_real_evidence(db)

    print("[seed] complete:", result)
    if result["added"] == 0 and result["skipped"] > 0:
        print("[seed] all studies already present, nothing to add.")
    print("[seed] tip: set a real OPENAI_API_KEY in .env to generate real embeddings.")


if __name__ == "__main__":
    asyncio.run(main())
