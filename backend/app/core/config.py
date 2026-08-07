from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "OncoPath"
    DATABASE_URL: str = "sqlite+aiosqlite:///./oncopath.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "super_secret_key_for_jwt_which_should_be_changed_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Security
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # LLM Configuration
    OPENAI_API_KEY: str = "sk-mock-key-for-development"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL_NAME: str = "gpt-4-turbo-preview"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
