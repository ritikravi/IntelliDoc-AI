from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # API Keys
    GEMINI_API_KEY: str
    OPENAI_API_KEY: Optional[str] = None
    
    # Database
    MONGODB_URI: str
    REDIS_URL: str = "redis://localhost:6379"
    
    # OCR
    OCR_ENGINE: str = "paddleocr"
    OCR_LANGUAGE: str = "en"
    TESSERACT_PATH: Optional[str] = "/usr/bin/tesseract"
    
    # Processing
    MAX_WORKERS: int = 4
    BATCH_SIZE: int = 8
    CONFIDENCE_THRESHOLD: float = 0.7
    
    # Model Paths
    LAYOUTLM_MODEL_PATH: str = "./ml_models/layoutlmv3"
    DONUT_MODEL_PATH: str = "./ml_models/donut"
    FAISS_INDEX_PATH: str = "./ml_models/faiss_index"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
