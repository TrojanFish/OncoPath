import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.models.evidence import Evidence
import json

class VectorSearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_embedding(self, text_input: str) -> List[float]:
        """
        Mock embedding generation.
        In a real Docker environment with OPENAI_API_KEY, 
        this would call openai.Embedding.create(input=text_input, model="text-embedding-ada-002").
        """
        import openai
        # Try real API if configured, else return a mock vector
        key = os.getenv("OPENAI_API_KEY")
        if key and "mock" not in key:
            try:
                response = await openai.AsyncOpenAI(api_key=key).embeddings.create(
                    input=text_input, 
                    model="text-embedding-ada-002"
                )
                return response.data[0].embedding
            except Exception as e:
                print(f"Embedding failed: {e}")
        
        # Return mock 1536-dimensional vector
        return [0.0] * 1536

    async def search_evidence(self, query: str, limit: int = 5) -> List[Evidence]:
        """
        Searches the pgvector database for the closest evidence to the query.
        Falls back to ILIKE if pgvector is not available (e.g. local SQLite).
        """
        # Note: This requires PostgreSQL + pgvector extension.
        # Ensure the evidence table has an 'embedding' Column(Vector(1536))
        
        try:
            # Try vector search
            query_embedding = await self.get_embedding(query)
            
            # Using pgvector cosine distance `<=>`
            sql_query = text("""
                SELECT id, title, authors, year, journal, summary, keywords, url 
                FROM evidences 
                ORDER BY embedding <=> :embedding 
                LIMIT :limit
            """)
            
            result = await self.db.execute(sql_query, {"embedding": json.dumps(query_embedding), "limit": limit})
            rows = result.fetchall()
            
            # Map back to Evidence model manually
            evidences = []
            for r in rows:
                evidences.append(Evidence(
                    id=r.id, title=r.title, authors=r.authors, 
                    year=r.year, journal=r.journal, 
                    summary=r.summary, keywords=r.keywords, url=r.url
                ))
            return evidences
            
        except Exception as e:
            # Fallback to simple ILIKE for SQLite / missing pgvector
            print(f"Vector search failed (likely using SQLite). Falling back to keyword search. Error: {e}")
            from sqlalchemy.future import select
            
            words = query.split()
            base_query = select(Evidence)
            for w in words:
                base_query = base_query.where(
                    (Evidence.keywords.ilike(f"%{w}%")) | 
                    (Evidence.summary.ilike(f"%{w}%"))
                )
                
            result = await self.db.execute(base_query.limit(limit))
            return result.scalars().all()
