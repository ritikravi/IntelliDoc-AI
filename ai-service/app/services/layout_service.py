from transformers import LayoutLMv3Processor, LayoutLMv3ForTokenClassification
import torch
from PIL import Image
import io
from typing import Dict, List
import re

class LayoutService:
    def __init__(self):
        # Note: In production, download and use actual LayoutLMv3 model
        # For now, we'll use rule-based extraction as fallback
        self.use_model = False
        
        if self.use_model:
            try:
                self.processor = LayoutLMv3Processor.from_pretrained(
                    "microsoft/layoutlmv3-base"
                )
                self.model = LayoutLMv3ForTokenClassification.from_pretrained(
                    "microsoft/layoutlmv3-base"
                )
            except:
                self.use_model = False
    
    def extract_invoice_number(self, text: str) -> str:
        """Extract invoice number using regex patterns"""
        patterns = [
            r'Invoice\s*#?\s*:?\s*([A-Z0-9\-]+)',
            r'INV[-\s]?(\d+)',
            r'Bill\s*No\.?\s*:?\s*([A-Z0-9\-]+)',
            r'Receipt\s*#?\s*:?\s*([A-Z0-9\-]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        return ""
    
    def extract_vendor_name(self, text: str) -> str:
        """Extract vendor name (usually at the top)"""
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if len(line) > 3 and not any(char.isdigit() for char in line[:10]):
                return line
        return ""
    
    def extract_gst_number(self, text: str) -> str:
        """Extract GST number"""
        pattern = r'\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}'
        match = re.search(pattern, text)
        return match.group(0) if match else ""
    
    def extract_dates(self, text: str) -> Dict[str, str]:
        """Extract invoice and due dates"""
        date_patterns = [
            r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
            r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})',
            r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})',
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        result = {}
        if len(dates) >= 1:
            result['invoice_date'] = dates[0]
        if len(dates) >= 2:
            result['due_date'] = dates[1]
        
        return result
    
    def extract_amounts(self, text: str) -> Dict[str, float]:
        """Extract monetary amounts"""
        # Find all amounts
        amount_pattern = r'(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)'
        amounts = re.findall(amount_pattern, text, re.IGNORECASE)
        
        # Clean and convert to float
        cleaned_amounts = []
        for amount in amounts:
            cleaned = amount.replace(',', '')
            try:
                cleaned_amounts.append(float(cleaned))
            except:
                pass
        
        result = {}
        if cleaned_amounts:
            # Assume largest amount is total
            result['total_amount'] = max(cleaned_amounts)
            
            # Try to find subtotal and tax
            if len(cleaned_amounts) >= 2:
                sorted_amounts = sorted(cleaned_amounts, reverse=True)
                result['subtotal'] = sorted_amounts[1]
                result['tax_amount'] = sorted_amounts[0] - sorted_amounts[1]
        
        return result
    
    def extract_line_items(self, text: str) -> List[Dict]:
        """Extract line items from invoice"""
        # This is a simplified version
        # In production, use table detection and LayoutLM
        lines = text.split('\n')
        items = []
        
        for line in lines:
            # Look for lines with item description and amount
            if re.search(r'\d+(?:,\d+)*(?:\.\d{2})?', line):
                items.append({
                    "description": line.strip(),
                    "amount": 0.0,  # Would extract from line
                })
        
        return items[:10]  # Limit to 10 items
    
    async def extract_fields(
        self,
        text: str,
        bounding_boxes: List[Dict],
    ) -> Dict:
        """Extract structured fields from OCR text"""
        
        invoice_number = self.extract_invoice_number(text)
        vendor_name = self.extract_vendor_name(text)
        gst_number = self.extract_gst_number(text)
        dates = self.extract_dates(text)
        amounts = self.extract_amounts(text)
        line_items = self.extract_line_items(text)
        
        return {
            "invoice_number": invoice_number,
            "vendor_name": vendor_name,
            "gst_number": gst_number,
            "invoice_date": dates.get("invoice_date", ""),
            "due_date": dates.get("due_date", ""),
            "subtotal": amounts.get("subtotal", 0.0),
            "tax_amount": amounts.get("tax_amount", 0.0),
            "total_amount": amounts.get("total_amount", 0.0),
            "currency": "INR",
            "line_items": line_items,
        }

layout_service = LayoutService()
