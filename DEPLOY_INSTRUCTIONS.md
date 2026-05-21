# 🚀 Deploy IntelliDoc AI - Step by Step

## ✅ Your Build is Ready!

Frontend is built and ready to deploy. Follow these steps:

---

## 📦 What You Have

- ✅ Frontend built successfully (`frontend/dist/`)
- ✅ Backend code ready
- ✅ AI Service code ready
- ✅ MongoDB configured
- ✅ Gemini API configured
- ✅ All environment variables set

---

## 🌐 STEP 1: Deploy Frontend to Vercel (5 minutes)

### **Run these commands:**

```bash
# Login to Vercel (opens browser)
vercel login

# Deploy frontend
cd frontend
vercel --prod
```

**Follow the prompts:**
1. Set up and deploy? → **Yes**
2. Which scope? → **Select your account**
3. Link to existing project? → **No**
4. Project name? → **intellidoc-ai** (or your choice)
5. In which directory? → **./** (current directory)
6. Override settings? → **No**

**Vercel will give you a URL like:**
```
https://intellidoc-ai-xxxxx.vercel.app
```

**Save this URL!** You'll need it for CORS configuration.

---

## 🖥️ STEP 2: Deploy Backend to Render (10 minutes)

### **Option A: Using Render Dashboard (Easier)**

1. **Go to:** https://render.com (create account if needed)

2. **Click:** "New +" → "Web Service"

3. **Connect GitHub:**
   - If you haven't pushed to GitHub yet:
     ```bash
     git init
     git add .
     git commit -m "Initial commit - IntelliDoc AI"
     git branch -M main
     # Create repo on GitHub first, then:
     git remote add origin https://github.com/YOUR_USERNAME/intellidoc-ai.git
     git push -u origin main
     ```
   - Connect your repository on Render

4. **Configure Service:**
   - **Name:** `intellidoc-backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` or `Starter`

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/intellidoc?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=intellidoc-jwt-secret-key-2026-hackathon-iit-super-secure-change-in-production
   JWT_REFRESH_SECRET=intellidoc-refresh-secret-key-2026-hackathon-iit-super-secure-change-in-production
   GEMINI_API_KEY=AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw
   CORS_ORIGIN=https://intellidoc-ai-xxxxx.vercel.app
   AI_SERVICE_URL=https://intellidoc-ai-service.onrender.com
   ```
   
   **Replace** `https://intellidoc-ai-xxxxx.vercel.app` with your actual Vercel URL!

6. **Click:** "Create Web Service"

7. **Wait** for deployment (5-10 minutes)

8. **Your backend URL will be:**
   ```
   https://intellidoc-backend.onrender.com
   ```

---

## 🤖 STEP 3: Deploy AI Service to Render (15 minutes)

1. **Go to:** https://render.com

2. **Click:** "New +" → "Web Service"

3. **Select** your repository again

4. **Configure Service:**
   - **Name:** `intellidoc-ai-service`
   - **Environment:** `Python 3`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** `ai-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Starter` (Free tier may be too slow)

5. **Add Environment Variables:**
   ```
   GEMINI_API_KEY=AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw
   MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/intellidoc?retryWrites=true&w=majority&appName=Cluster0
   ENVIRONMENT=production
   OCR_ENGINE=paddleocr
   OCR_LANGUAGE=en
   CONFIDENCE_THRESHOLD=0.7
   ```

6. **Click:** "Create Web Service"

7. **Wait** for deployment (10-15 minutes - ML packages are large)

8. **Your AI service URL will be:**
   ```
   https://intellidoc-ai-service.onrender.com
   ```

---

## 🔄 STEP 4: Update Frontend Environment Variables

Now that you have backend and AI service URLs, update your frontend:

1. **Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add/Update these variables:**
   ```
   VITE_API_URL=https://intellidoc-backend.onrender.com/api/v1
   VITE_AI_SERVICE_URL=https://intellidoc-ai-service.onrender.com
   VITE_WS_URL=wss://intellidoc-backend.onrender.com
   ```

3. **Redeploy frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

---

## 🔄 STEP 5: Update Backend CORS

1. **Go to:** Render Dashboard → intellidoc-backend → Environment

2. **Update CORS_ORIGIN:**
   ```
   CORS_ORIGIN=https://your-actual-vercel-url.vercel.app
   ```

3. **Save** - Render will automatically redeploy

---

## ✅ STEP 6: Test Your Deployment!

1. **Open your frontend URL:**
   ```
   https://intellidoc-ai-xxxxx.vercel.app
   ```

2. **Register a new account**

3. **Upload a test invoice**

4. **Verify everything works!**

---

## 🎯 Your Live URLs

After deployment, you'll have:

```
✅ Frontend:    https://intellidoc-ai-xxxxx.vercel.app
✅ Backend:     https://intellidoc-backend.onrender.com
✅ AI Service:  https://intellidoc-ai-service.onrender.com
✅ API Docs:    https://intellidoc-ai-service.onrender.com/docs
```

---

## 🐛 Troubleshooting

### **Frontend shows "Network Error":**
- Check backend URL in environment variables
- Verify CORS is configured correctly
- Check backend logs on Render

### **Backend won't start:**
- Check environment variables are set
- Verify MongoDB URI is correct
- Check logs on Render dashboard

### **AI Service timeout:**
- Upgrade to paid tier (free tier is slow)
- Check Gemini API quota
- Verify all dependencies installed

### **CORS Error:**
- Update CORS_ORIGIN in backend to match frontend URL
- Redeploy backend after updating

---

## 💡 Alternative: Deploy Everything Locally First

If you want to test locally before deploying:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - AI Service
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3 - Frontend
cd frontend
npm run dev
```

Then open: http://localhost:5173

---

## 📊 Deployment Timeline

- **Frontend (Vercel):** 2-3 minutes
- **Backend (Render):** 5-10 minutes
- **AI Service (Render):** 10-15 minutes
- **Configuration:** 5 minutes
- **Total:** ~30 minutes

---

## 🎉 You're Live!

Once deployed:
1. Share your demo URL
2. Test all features
3. Prepare your presentation
4. Win the hackathon! 🏆

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Check logs** on respective dashboards
- **See DEPLOYMENT.md** for more details

---

**Ready to deploy? Start with Step 1! 🚀**
