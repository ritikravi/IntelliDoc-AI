# IntelliDoc AI - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 20+
- Python 3.10+
- MongoDB Atlas account (free tier)
- Gemini API key (free from Google AI Studio)

### Step 1: Clone and Setup Environment

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your credentials:
# - MONGODB_URI (from MongoDB Atlas)
# - GEMINI_API_KEY (from Google AI Studio)
# - JWT_SECRET (generate random string)
# - CLOUDINARY credentials (optional, for file storage)
```

### Step 2: Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### Step 3: Start Services

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Manual Start**

Terminal 1 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

Terminal 3 - AI Service:
```bash
cd ai-service
uvicorn main:app --reload --port 8000
```

### Step 4: Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📋 Detailed Setup

### MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster (M0 Free tier)
4. Create database user
5. Whitelist IP (0.0.0.0/0 for development)
6. Get connection string
7. Add to `.env` as `MONGODB_URI`

### Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env` as `GEMINI_API_KEY`

### Cloudinary Setup (Optional)

1. Go to https://cloudinary.com
2. Create free account
3. Get cloud name, API key, and secret
4. Add to `.env`

---

## 🧪 Testing the Application

### 1. Register Account
- Go to http://localhost:5173/register
- Create account with email/password

### 2. Upload Document
- Navigate to Upload page
- Drag & drop an invoice/receipt
- Watch real-time processing

### 3. View Results
- Check Documents page for processed files
- View extracted data with confidence scores
- See bounding boxes visualization

### 4. Analytics
- View dashboard for statistics
- Check vendor analytics
- See processing trends

### 5. AI Chat
- Ask questions like:
  - "Show invoices above 50,000 INR"
  - "Which vendor has highest spending?"
  - "Find invoices from Amazon"

---

## 🐳 Docker Deployment

### Build Images
```bash
docker-compose build
```

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

---

## 🚢 Production Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy --prod
```

### Backend (Render/Railway)

1. Push code to GitHub
2. Connect repository to Render/Railway
3. Add environment variables
4. Deploy

### AI Service (Render/Railway)

1. Create Python service
2. Add environment variables
3. Deploy with `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 🔧 Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend connection error
- Check MongoDB URI is correct
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify Redis is running

### AI Service errors
```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install libgl1-mesa-glx

# Reinstall Python packages
pip install --upgrade -r requirements.txt
```

### OCR not working
- Ensure Tesseract is installed
- Check PaddleOCR installation
- Verify image format is supported

---

## 📊 Performance Optimization

### Backend
- Enable Redis caching
- Use MongoDB indexes
- Implement rate limiting

### AI Service
- Use GPU for faster processing
- Batch process documents
- Cache model predictions

### Frontend
- Enable code splitting
- Optimize images
- Use CDN for assets

---

## 🔐 Security Checklist

- [ ] Change default JWT secrets
- [ ] Enable HTTPS in production
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables
- [ ] Enable MongoDB authentication
- [ ] Secure Redis with password

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [PaddleOCR Guide](https://github.com/PaddlePaddle/PaddleOCR)
- [Gemini API Docs](https://ai.google.dev/docs)

---

## 🤝 Support

For issues and questions:
1. Check troubleshooting section
2. Review logs: `docker-compose logs`
3. Check API documentation: http://localhost:8000/docs

---

**Built for IIT Hackathon 2026** 🚀
