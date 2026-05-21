# 🚀 Deploy IntelliDoc AI Now!

## ✅ Frontend Build Successful!

Your frontend is built and ready to deploy.

---

## 🌐 Deploy to Vercel (Fastest - 5 minutes)

### **Option 1: Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd frontend
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **intellidoc-ai** (or your choice)
- Directory? **./frontend**
- Override settings? **No**

### **Option 2: GitHub + Vercel Dashboard**

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit - IntelliDoc AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/intellidoc-ai.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Framework: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variables:
     ```
     VITE_API_URL=https://your-backend-url.com/api/v1
     VITE_AI_SERVICE_URL=https://your-ai-service-url.com
     VITE_WS_URL=wss://your-backend-url.com
     ```
   - Click "Deploy"

---

## 🖥️ Deploy Backend to Render

### **Step 1: Push to GitHub** (if not done)

```bash
git init
git add .
git commit -m "Initial commit"
git push
```

### **Step 2: Deploy on Render**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** intellidoc-backend
   - **Environment:** Node
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Starter (or Free)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/intellidoc?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=intellidoc-jwt-secret-key-2026-hackathon-iit-super-secure-change-in-production
   JWT_REFRESH_SECRET=intellidoc-refresh-secret-key-2026-hackathon-iit-super-secure-change-in-production
   GEMINI_API_KEY=AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw
   AI_SERVICE_URL=https://your-ai-service.onrender.com
   CORS_ORIGIN=https://your-frontend.vercel.app
   REDIS_URL=redis://red-xxxxx:6379
   ```

6. Click "Create Web Service"

---

## 🤖 Deploy AI Service to Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** intellidoc-ai-service
   - **Environment:** Python 3
   - **Root Directory:** ai-service
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Starter (needs more resources)

5. Add Environment Variables:
   ```
   GEMINI_API_KEY=AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw
   MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/intellidoc?retryWrites=true&w=majority&appName=Cluster0
   ENVIRONMENT=production
   OCR_ENGINE=paddleocr
   ```

6. Click "Create Web Service"

---

## 🔄 Update Frontend with Backend URLs

After deploying backend and AI service, update frontend environment variables on Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   ```
   VITE_API_URL=https://intellidoc-backend.onrender.com/api/v1
   VITE_AI_SERVICE_URL=https://intellidoc-ai-service.onrender.com
   VITE_WS_URL=wss://intellidoc-backend.onrender.com
   ```
3. Redeploy frontend

---

## 🎯 Quick Deploy (All at Once)

### **Using Vercel for Frontend:**
```bash
cd frontend
vercel --prod
```

### **Using Railway for Backend & AI Service:**

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Deploy Backend:
```bash
cd backend
railway login
railway init
railway up
```

3. Deploy AI Service:
```bash
cd ai-service
railway init
railway up
```

---

## ✅ Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render/Railway
- [ ] AI Service deployed to Render/Railway
- [ ] Environment variables configured
- [ ] MongoDB Atlas accessible
- [ ] CORS configured correctly
- [ ] Test the live application

---

## 🌐 Your Live URLs

After deployment, you'll have:

```
Frontend:    https://intellidoc-ai.vercel.app
Backend:     https://intellidoc-backend.onrender.com
AI Service:  https://intellidoc-ai-service.onrender.com
```

---

## 🧪 Test Your Deployment

1. Open your frontend URL
2. Register a new account
3. Upload a test invoice
4. Verify processing works
5. Check dashboard and analytics

---

## 🐛 Troubleshooting

### **Build Fails on Vercel:**
- Check build logs
- Verify all dependencies are in package.json
- Ensure environment variables are set

### **Backend Connection Error:**
- Check CORS_ORIGIN includes your frontend URL
- Verify MongoDB URI is correct
- Check environment variables

### **AI Service Timeout:**
- Upgrade to paid tier (free tier may be slow)
- Check Gemini API quota
- Verify dependencies installed correctly

---

## 💡 Pro Tips

1. **Use Render for Backend** - Free tier available
2. **Use Vercel for Frontend** - Best for React apps
3. **MongoDB Atlas** - Already configured
4. **Redis Cloud** - Optional, add later if needed
5. **Monitor Logs** - Check deployment logs for errors

---

## 🎉 You're Live!

Once deployed, share your links:
- Demo URL: https://your-app.vercel.app
- GitHub: https://github.com/your-username/intellidoc-ai
- Presentation: Use HACKATHON_PRESENTATION.md

---

**Need help? Check DEPLOYMENT.md for detailed instructions!**

**Good luck! 🚀**
