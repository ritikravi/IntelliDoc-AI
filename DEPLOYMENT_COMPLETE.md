# 🚀 IntelliDoc AI - Deployment Complete!

## ✅ What's Already Deployed

Your **frontend is already live** on Vercel!

### **Live URLs:**
- **Frontend:** https://intellidoc-ai-ten.vercel.app
- **Alternate:** https://intellidoc-mjm8dmn47-ritiks-projects-dfb1bf53.vercel.app

---

## 🎯 Next Steps - Deploy Backend & AI Service

Since we have a GitHub credential issue, let's deploy directly from Vercel/Render dashboards:

### **Option 1: Manual GitHub Push (Recommended)**

Open your terminal and run:

```bash
# Clear old credentials
git config --global --unset credential.helper
rm -f ~/.git-credentials

# Use GitHub CLI (easiest)
brew install gh
gh auth login
# Select: GitHub.com → HTTPS → Login with browser → Authorize

# Then push
git push -u origin main
```

### **Option 2: Deploy Without GitHub**

You can deploy directly from local files:

#### **Deploy Backend to Render:**
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Choose "Deploy from Git" → "Public Git Repository"
4. Enter: `https://github.com/ritikravi/IntelliDoc-AI-`
5. Or use "Deploy from local directory" if available

#### **Deploy AI Service:**
Same process as backend, but:
- Root Directory: `ai-service`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 🌐 Your Frontend is Live!

**Test it now:** https://intellidoc-ai-ten.vercel.app

Currently it will show connection errors because backend isn't deployed yet.

---

## 📝 Environment Variables Needed

### **For Backend (Render):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/intellidoc?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=intellidoc-jwt-secret-key-2026-hackathon-iit-super-secure-change-in-production
JWT_REFRESH_SECRET=intellidoc-refresh-secret-key-2026-hackathon-iit-super-secure-change-in-production
GEMINI_API_KEY=AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw
CORS_ORIGIN=https://intellidoc-ai-ten.vercel.app
AI_SERVICE_URL=https://your-ai-service.onrender.com
```

### **For AI Service (Render):**
```
GEMINI_API_KEY=AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw
MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/intellidoc?retryWrites=true&w=majority&appName=Cluster0
ENVIRONMENT=production
OCR_ENGINE=paddleocr
```

---

## 🎯 Quick Deploy Steps

### **1. Push to GitHub (Fix credentials first):**

```bash
# Install GitHub CLI
brew install gh

# Login
gh auth login

# Push
git push -u origin main
```

### **2. Deploy Backend:**
- Go to https://render.com
- New Web Service
- Connect GitHub repo
- Root: `backend`
- Add environment variables
- Deploy!

### **3. Deploy AI Service:**
- Same as backend
- Root: `ai-service`
- Add environment variables
- Deploy!

### **4. Update Frontend URLs:**
- Go to Vercel dashboard
- Update environment variables with backend URLs
- Redeploy

---

## ✅ What You Have Now

- ✅ Frontend deployed and live
- ✅ All code committed locally
- ✅ Environment variables configured
- ✅ MongoDB and Gemini API ready
- ⏳ Backend needs deployment
- ⏳ AI Service needs deployment

---

## 🚀 Alternative: Use Railway

If Render is slow, try Railway:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy AI service
cd ../ai-service
railway init
railway up
```

---

## 🎉 You're Almost There!

Just need to:
1. Fix GitHub credentials (use `gh auth login`)
2. Push to GitHub
3. Deploy backend and AI service from GitHub

Or deploy directly from Render/Railway dashboards!

---

**Your frontend is already live! 🎊**

**URL:** https://intellidoc-ai-ten.vercel.app

---

## 📞 Need Help?

The main issue is GitHub credentials. Fix it with:
```bash
gh auth login
```

Then everything else will be smooth!

**You're 90% there! 🚀**
