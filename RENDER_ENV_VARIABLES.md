# 🔐 Environment Variables for Render Deployment

## 📦 BACKEND Environment Variables

When deploying the **backend** on Render, add these environment variables:

```
MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/?appName=Cluster0

JWT_SECRET=intellidoc_jwt_secret_key_2026_hackathon_production

JWT_REFRESH_SECRET=intellidoc_refresh_secret_key_2026_secure

NODE_ENV=production

PORT=5000

FRONTEND_URL=https://intellidoc-ai-ten.vercel.app

CLOUDINARY_CLOUD_NAME=your_cloudinary_name

CLOUDINARY_API_KEY=your_cloudinary_key

CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### How to Add in Render:

1. When creating the backend web service
2. Scroll down to "Environment Variables"
3. Click "Add Environment Variable"
4. Add each variable one by one:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/?appName=Cluster0`
5. Repeat for all variables above

---

## 🤖 AI SERVICE Environment Variables

When deploying the **AI service** on Render, add these:

```
GEMINI_API_KEY=AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw

MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/?appName=Cluster0

ENVIRONMENT=production
```

### How to Add in Render:

Same process as backend:
1. Scroll to "Environment Variables"
2. Add each variable one by one

---

## 🌐 FRONTEND Environment Variables (Vercel)

After backend and AI service are deployed, update Vercel:

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Select your project:** `intellidoc-ai`
3. **Go to:** Settings → Environment Variables
4. **Add these:**

```
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com

VITE_AI_API_URL=https://YOUR-AI-SERVICE-URL.onrender.com
```

**Replace:**
- `YOUR-BACKEND-URL` with your actual backend URL from Render
- `YOUR-AI-SERVICE-URL` with your actual AI service URL from Render

Example:
```
VITE_API_URL=https://intellidoc-backend.onrender.com
VITE_AI_API_URL=https://intellidoc-ai-service.onrender.com
```

5. **Redeploy** the frontend after adding these

---

## 📋 Quick Copy-Paste Format

### For Backend (Render):
```
MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/?appName=Cluster0
JWT_SECRET=intellidoc_jwt_secret_key_2026_hackathon_production
JWT_REFRESH_SECRET=intellidoc_refresh_secret_key_2026_secure
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://intellidoc-ai-ten.vercel.app
```

### For AI Service (Render):
```
GEMINI_API_KEY=AIzaSyDHier3XHpkXQkWr1__fSHAWPgIyjY6MZw
MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/?appName=Cluster0
ENVIRONMENT=production
```

---

## ⚠️ Important Notes

1. **Don't include quotes** around values in Render
2. **Copy exactly** as shown above
3. **PORT** is automatically set by Render, but we include it for clarity
4. **Cloudinary** variables are optional (for file uploads)
5. Update **VITE_API_URL** and **VITE_AI_API_URL** in Vercel AFTER you get the Render URLs

---

## 🎯 Deployment Order

1. ✅ Deploy Backend → Get URL
2. ✅ Deploy AI Service → Get URL
3. ✅ Update Frontend with both URLs → Redeploy

---

That's it! Copy-paste these values when Render asks for environment variables! 🚀
