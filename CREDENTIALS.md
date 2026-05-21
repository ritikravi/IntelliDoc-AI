# 🔐 IntelliDoc AI - Credentials & Configuration

## ✅ Your Configuration

### **MongoDB Atlas**
```
URI: mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/intellidoc
Database: intellidoc
Status: ✅ Configured
```

### **Gemini API**
```
API Key: AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw
Status: ✅ Configured
```

### **JWT Secrets**
```
JWT_SECRET: intellidoc-jwt-secret-key-2026-hackathon-iit-super-secure-change-in-production
JWT_REFRESH_SECRET: intellidoc-refresh-secret-key-2026-hackathon-iit-super-secure-change-in-production
Status: ✅ Auto-generated
```

---

## 📁 Environment Files Created

All `.env` files have been created and configured:

1. **Root `.env`** - Main configuration
2. **`backend/.env`** - Backend specific
3. **`frontend/.env`** - Frontend specific
4. **`ai-service/.env`** - AI service specific

---

## 🔒 Security Notes

### **For Development:**
- ✅ Current configuration is perfect for local development
- ✅ MongoDB Atlas is already secured
- ✅ Gemini API key is active

### **For Production:**
1. **Change JWT Secrets** - Generate new random strings
2. **Rotate API Keys** - Create production Gemini API key
3. **Update MongoDB** - Use production cluster
4. **Enable HTTPS** - Use SSL certificates
5. **Add Rate Limiting** - Already configured
6. **Enable Monitoring** - Add Sentry/LogRocket

---

## 🌐 Service URLs

### **Development (Local)**
```
Frontend:    http://localhost:5173
Backend:     http://localhost:5000
AI Service:  http://localhost:8000
API Docs:    http://localhost:8000/docs
MongoDB:     MongoDB Atlas (cloud)
Redis:       localhost:6379
```

### **Production (After Deployment)**
```
Frontend:    https://your-app.vercel.app
Backend:     https://your-backend.onrender.com
AI Service:  https://your-ai-service.onrender.com
MongoDB:     MongoDB Atlas (cloud)
Redis:       Redis Cloud
```

---

## 🧪 Test Credentials

### **Create Your First User**
When you start the app, register with:
```
Name: Demo User
Email: demo@intellidoc.ai
Password: Demo@123456
```

Or use any email/password you prefer!

---

## 📊 API Access

### **Backend API**
```
Base URL: http://localhost:5000/api/v1
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer <your-jwt-token>
```

### **AI Service API**
```
Base URL: http://localhost:8000
Docs: http://localhost:8000/docs
Interactive: http://localhost:8000/redoc
```

---

## 🔑 API Keys You Might Need Later

### **Optional Services** (Not required for basic functionality)

**Cloudinary (File Storage):**
- Sign up: https://cloudinary.com
- Get: Cloud Name, API Key, API Secret
- Add to `.env` when ready

**Google OAuth (Social Login):**
- Console: https://console.cloud.google.com
- Get: Client ID, Client Secret
- Add to `.env` when ready

**Sentry (Error Tracking):**
- Sign up: https://sentry.io
- Get: DSN
- Add to `.env` when ready

---

## 🚀 Quick Start Commands

### **Start Everything (Docker)**
```bash
docker-compose up -d
```

### **Start Manually**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd ai-service && uvicorn main:app --reload --port 8000

# Terminal 3
cd frontend && npm run dev
```

---

## 🔍 Verify Configuration

### **Check Backend Connection**
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

### **Check AI Service**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### **Check Frontend**
```bash
# Open browser: http://localhost:5173
# Should see login page
```

---

## 📝 Important Notes

1. **MongoDB Atlas** - Already configured, no additional setup needed
2. **Gemini API** - Has free tier, sufficient for development and demo
3. **Redis** - Optional for development, required for production
4. **Cloudinary** - Optional, can use local storage for now

---

## 🆘 If Something Goes Wrong

### **MongoDB Connection Issues**
- Check internet connection
- Verify MongoDB Atlas cluster is running
- Check IP whitelist (should be 0.0.0.0/0 for development)

### **Gemini API Issues**
- Check API key is correct
- Verify you have quota remaining
- Check: https://makersuite.google.com/app/apikey

### **Port Conflicts**
```bash
# Kill processes on ports
lsof -i :5000 && kill -9 <PID>
lsof -i :5173 && kill -9 <PID>
lsof -i :8000 && kill -9 <PID>
```

---

## ✅ Configuration Checklist

- [x] MongoDB URI configured
- [x] Gemini API key configured
- [x] JWT secrets generated
- [x] Frontend .env created
- [x] Backend .env created
- [x] AI Service .env created
- [x] CORS configured
- [x] Service URLs set

**You're all set! 🎉**

---

## 🔐 Security Reminder

**⚠️ IMPORTANT:** 
- Never commit `.env` files to Git
- Never share API keys publicly
- Rotate keys regularly in production
- Use environment variables in deployment

The `.gitignore` file is already configured to exclude `.env` files.

---

**Ready to start? See START_HERE.md for next steps!**
