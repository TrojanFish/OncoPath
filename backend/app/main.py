from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import health, auth, evidence, analysis, cases
from app.core.config import settings
from app.core.database import engine, Base
import app.models # Ensure models are loaded before create_all

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(evidence.router, prefix="/api/evidence", tags=["evidence"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(cases.router, prefix="/api/cases", tags=["cases"])

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
