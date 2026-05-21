import cv2
import numpy as np
from paddleocr import PaddleOCR
import pytesseract
from PIL import Image
import io
from typing import Dict, List, Tuple

from app.core.config import settings

class OCRService:
    def __init__(self):
        self.paddle_ocr = PaddleOCR(
            use_angle_cls=True,
            lang=settings.OCR_LANGUAGE,
            use_gpu=False,
        )
        if settings.TESSERACT_PATH:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess image for better OCR results
        - Convert to grayscale
        - Denoise
        - Deskew
        - Enhance contrast
        """
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        # Deskew
        coords = np.column_stack(np.where(denoised > 0))
        if len(coords) > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            
            if abs(angle) > 0.5:
                (h, w) = denoised.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                denoised = cv2.warpAffine(
                    denoised,
                    M,
                    (w, h),
                    flags=cv2.INTER_CUBIC,
                    borderMode=cv2.BORDER_REPLICATE,
                )
        
        # Enhance contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        # Threshold
        _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return binary
    
    def extract_text_paddle(self, image: np.ndarray) -> Tuple[str, List[Dict], float]:
        """Extract text using PaddleOCR"""
        result = self.paddle_ocr.ocr(image, cls=True)
        
        if not result or not result[0]:
            return "", [], 0.0
        
        text_lines = []
        bounding_boxes = []
        confidences = []
        
        for line in result[0]:
            bbox = line[0]
            text = line[1][0]
            confidence = line[1][1]
            
            text_lines.append(text)
            bounding_boxes.append({
                "text": text,
                "bbox": bbox,
                "confidence": confidence,
            })
            confidences.append(confidence)
        
        full_text = "\n".join(text_lines)
        avg_confidence = np.mean(confidences) if confidences else 0.0
        
        return full_text, bounding_boxes, avg_confidence
    
    def extract_text_tesseract(self, image: np.ndarray) -> Tuple[str, List[Dict], float]:
        """Extract text using Tesseract OCR"""
        pil_image = Image.fromarray(image)
        
        # Get detailed data
        data = pytesseract.image_to_data(pil_image, output_type=pytesseract.Output.DICT)
        
        text_lines = []
        bounding_boxes = []
        confidences = []
        
        n_boxes = len(data['text'])
        for i in range(n_boxes):
            if int(data['conf'][i]) > 0:
                text = data['text'][i].strip()
                if text:
                    x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
                    confidence = int(data['conf'][i]) / 100.0
                    
                    text_lines.append(text)
                    bounding_boxes.append({
                        "text": text,
                        "bbox": [[x, y], [x + w, y], [x + w, y + h], [x, y + h]],
                        "confidence": confidence,
                    })
                    confidences.append(confidence)
        
        full_text = " ".join(text_lines)
        avg_confidence = np.mean(confidences) if confidences else 0.0
        
        return full_text, bounding_boxes, avg_confidence
    
    async def process_document(
        self,
        image_bytes: bytes,
        engine: str = "paddleocr",
    ) -> Dict:
        """Main OCR processing pipeline"""
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
        
        # Preprocess
        preprocessed = self.preprocess_image(image)
        
        # Extract text
        if engine == "paddleocr":
            text, bboxes, confidence = self.extract_text_paddle(preprocessed)
        else:
            text, bboxes, confidence = self.extract_text_tesseract(preprocessed)
        
        return {
            "text": text,
            "bounding_boxes": bboxes,
            "confidence": confidence,
            "engine": engine,
        }

ocr_service = OCRService()
