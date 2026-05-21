from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr_service import ocr_service

router = APIRouter()

@router.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from uploaded image/PDF"""
    try:
        contents = await file.read()
        result = await ocr_service.process_document(contents)
        
        return {
            "success": True,
            "text": result["text"],
            "confidence": result["confidence"],
            "engine": result["engine"],
            "bounding_boxes": result["bounding_boxes"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
