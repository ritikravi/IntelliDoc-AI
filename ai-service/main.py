from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.api.routes import ocr, process, search, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting AI Service...")
    print(f"📝 Environment: {settings.ENVIRONMENT}")
    yield
    # Shutdown
    print("👋 Shutting down AI Service...")

app = FastAPI(
    title="IntelliDoc AI Service",
    description="AI-powered document processing microservice",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "IntelliDoc AI",
        "version": "1.0.0",
    }

# Routes
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(process.router, prefix="/api", tags=["Processing"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
