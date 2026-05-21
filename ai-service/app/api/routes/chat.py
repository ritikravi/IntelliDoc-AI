from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.services.llm_service import llm_service

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    userId: str
    context: Optional[List[str]] = None

@router.post("/chat")
async def chat_query(request: ChatRequest):
    """
    RAG-based chatbot for querying invoice data
    """
    try:
        # In production:
        # 1. Retrieve relevant documents from vector DB
        # 2. Build context from documents
        # 3. Generate response using LLM
        
        context = "\n".join(request.context) if request.context else "No context provided"
        
        response = await llm_service.answer_query(
            request.query,
            context,
        )
        
        return {
            "success": True,
            "response": response,
            "sources": [],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
