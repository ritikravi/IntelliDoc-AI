from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import time

from app.services.ocr_service import ocr_service
from app.services.layout_service import layout_service
from app.services.llm_service import llm_service

router = APIRouter()

class ProcessRequest(BaseModel):
    documentId: str
    fileUrl: str
    fileType: str

@router.post("/process")
async def process_document(request: ProcessRequest):
    """
    Main document processing pipeline:
    1. Download image
    2. OCR extraction
    3. Layout understanding
    4. LLM validation
    """
    start_time = time.time()
    
    try:
        # Download image
        async with httpx.AsyncClient() as client:
            response = await client.get(request.fileUrl)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to download file")
            image_bytes = response.content
        
        # Step 1: OCR
        ocr_result = await ocr_service.process_document(
            image_bytes,
            engine="paddleocr",
        )
        
        # Step 2: Layout Understanding
        extracted_fields = await layout_service.extract_fields(
            ocr_result["text"],
            ocr_result["bounding_boxes"],
        )
        
        # Step 3: LLM Validation
        validated_data = await llm_service.validate_and_normalize(
            ocr_result["text"],
            extracted_fields,
        )
        
        processing_time = (time.time() - start_time) * 1000  # ms
        
        return {
            "success": True,
            "extractedData": {
                "invoiceNumber": validated_data.get("invoice_number", ""),
                "vendorName": validated_data.get("vendor_name", ""),
                "vendorGST": validated_data.get("gst_number", ""),
                "invoiceDate": validated_data.get("invoice_date", ""),
                "dueDate": validated_data.get("due_date", ""),
                "currency": validated_data.get("currency", "INR"),
                "subtotal": validated_data.get("subtotal", 0),
                "taxAmount": validated_data.get("tax_amount", 0),
                "totalAmount": validated_data.get("total_amount", 0),
                "lineItems": validated_data.get("line_items", []),
                "documentType": validated_data.get("document_type", "invoice"),
            },
            "confidenceScore": validated_data.get("confidence_score", ocr_result["confidence"]),
            "ocrEngine": ocr_result["engine"],
            "processingTime": processing_time,
            "boundingBoxes": ocr_result["bounding_boxes"],
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
