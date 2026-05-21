import google.generativeai as genai
from typing import Dict
import json

from app.core.config import settings

class LLMService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def validate_and_normalize(
        self,
        ocr_text: str,
        extracted_fields: Dict,
    ) -> Dict:
        """Use LLM to validate and normalize extracted data"""
        
        prompt = f"""
You are an AI assistant specialized in processing financial documents.

Given the following OCR text and extracted fields, please:
1. Validate the extracted information
2. Correct any OCR errors
3. Normalize the data format
4. Add a confidence score (0-1) for each field

OCR Text:
{ocr_text}

Extracted Fields:
{json.dumps(extracted_fields, indent=2)}

Please return a JSON object with:
- All corrected fields
- confidence_score: overall confidence (0-1)
- corrections_made: list of corrections
- document_type: type of document (invoice/receipt/purchase_order/quotation)

Return ONLY valid JSON, no additional text.
"""
        
        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Extract JSON from response
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            result = json.loads(result_text)
            return result
        except Exception as e:
            print(f"LLM validation error: {e}")
            # Return original data with lower confidence
            return {
                **extracted_fields,
                "confidence_score": 0.7,
                "corrections_made": [],
                "document_type": "invoice",
            }
    
    async def answer_query(
        self,
        query: str,
        context: str,
    ) -> str:
        """Answer user queries about invoices using RAG"""
        
        prompt = f"""
You are an AI assistant helping users query their invoice data.

Context (Invoice Data):
{context}

User Query: {query}

Please provide a helpful, accurate answer based on the context provided.
If the information is not in the context, say so.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error processing query: {str(e)}"

llm_service = LLMService()
