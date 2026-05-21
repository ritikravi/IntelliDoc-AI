# 🚀 IntelliDoc AI - Intelligent Financial Document Processing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)

## 🎯 Overview

IntelliDoc AI is a production-grade AI SaaS platform that extracts structured data from financial documents (invoices, receipts, purchase orders) using state-of-the-art OCR, Transformers, and LLMs.

### ✨ Key Features

- 🤖 **Advanced OCR Pipeline**: PaddleOCR + Tesseract with OpenCV preprocessing
- 📊 **Document Understanding**: LayoutLMv3 for intelligent field extraction
- 🧠 **LLM Validation**: Gemini API for error correction and normalization
- 💬 **RAG Chatbot**: Natural language querying over invoice data
- 📈 **Analytics Dashboard**: Real-time insights and visualizations
- 🔍 **Semantic Search**: FAISS-powered intelligent document search
- 🎨 **Premium UI**: Modern SaaS interface with dark/light mode
- 🔐 **Enterprise Auth**: JWT + OAuth with role-based access
- 🐳 **Docker Ready**: Fully containerized microservices

## 🏗️ Architecture

**Microservices Architecture:**
- **Frontend**: React + Vite + Tailwind + ShadCN
- **Backend**: Node.js + Express + MongoDB
- **AI Service**: Python FastAPI + ML Models
- **Database**: MongoDB Atlas + Redis
- **Storage**: Cloudinary/S3

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.10+
- Docker & Docker Compose
- MongoDB Atlas account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/intellidoc-ai.git
cd intellidoc-ai
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Run with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📦 Manual Setup

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 🎨 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS + ShadCN UI
- Framer Motion
- Zustand (State Management)
- React Query
- Recharts

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis
- JWT Authentication
- WebSockets

### AI/ML
- FastAPI
- PaddleOCR + Tesseract
- LayoutLMv3
- Donut Transformer
- LangChain + FAISS
- Gemini API
- OpenCV + PyTorch

## 📊 Features

### Document Processing
- Multi-format support (PDF, PNG, JPG, JPEG)
- Drag & drop upload
- Real-time processing status
- Confidence scoring
- Bounding box visualization

### Data Extraction
- Invoice number
- Vendor details
- GST/Tax numbers
- Line items
- Amounts & currency
- Dates & payment terms

### Analytics
- Processing statistics
- OCR accuracy tracking
- Vendor analytics
- Tax insights
- Revenue trends

### AI Features
- Semantic search
- Natural language queries
- RAG-powered chatbot
- Fraud detection
- Duplicate detection

## 🔐 Security

- JWT authentication with refresh tokens
- OAuth 2.0 integration
- Role-based access control
- Input validation
- Rate limiting
- CORS protection

## 📈 Performance

- Redis caching
- Query optimization
- Lazy loading
- Image optimization
- CDN integration

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# AI service tests
cd ai-service && pytest
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy --prod
```

### Backend (Render/Railway)
```bash
# Push to GitHub and connect to Render/Railway
```

### Database
- MongoDB Atlas (Cloud)
- Redis Cloud

## 📝 API Documentation

- Backend API: http://localhost:5000/api-docs
- AI Service: http://localhost:8000/docs

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

Built for IIT Hackathon 2026

## 🙏 Acknowledgments

- PaddleOCR Team
- Hugging Face Transformers
- FastAPI Framework
- React Community

---

**Made with ❤️ for intelligent document processing**
