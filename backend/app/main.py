from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import health, auth, evidence, analysis, cases, stats
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

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["evidence"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
