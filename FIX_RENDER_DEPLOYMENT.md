# 🔧 Fix Render Deployment Failure

## The Issue

Your deployment failed because Render needs the correct configuration.

## ✅ SOLUTION: Correct Render Configuration

### For Backend Deployment:

1. **Go to your Render service:** https://dashboard.render.com/

2. **Click on the failed service** (intellij)

3. **Go to Settings**

4. **Update these settings:**

```
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

5. **Make sure these environment variables are added:**

```
MONGODB_URI=mongodb+srv://ritiksatyam55_db_user:sL0THojq9KRUrhtz@cluster0.a9esyzb.mongodb.net/?appName=Cluster0
JWT_SECRET=intellidoc_jwt_secret_key_2026_hackathon_production
JWT_REFRESH_SECRET=intellidoc_refresh_secret_key_2026_secure
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://intellidoc-ai-ten.vercel.app
```

6. **Click "Save Changes"**

7. **Manual Deploy** → Click "Deploy latest commit"

---

## 🚨 Common Issues & Fixes

### Issue 1: Wrong Root Directory
**Fix:** Set `Root Directory` to `backend` (not empty)

### Issue 2: Missing package.json
**Fix:** Make sure `Root Directory` is set to `backend`

### Issue 3: Build fails
**Fix:** 
- Build Command: `npm install`
- Start Command: `npm start`

### Issue 4: Port issues
**Fix:** Add environment variable `PORT=5000`

---

## 📋 Step-by-Step Fix

1. **Delete the failed service:**
   - Go to Settings → scroll down
   - Click "Delete Web Service"

2. **Create new service with correct settings:**
   - Click "New +" → "Web Service"
   - Connect GitHub → Select `intellij` repo
   - **IMPORTANT:** Set these correctly:

```
Name: intellidoc-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend          ← IMPORTANT!
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

3. **Add Environment Variables:**
   - Click "Advanced"
   - Add all the variables from above

4. **Click "Create Web Service"**

5. **Wait 3-5 minutes**

---

## 🎯 Alternative: Check Logs

If it fails again:

1. Click on the service
2. Go to "Logs" tab
3. Look for error messages
4. Common errors:
   - `Cannot find module` → Wrong root directory
   - `ENOENT: no such file` → Wrong root directory
   - `Port already in use` → Add PORT env variable

---

## ✅ Correct Configuration Summary

**Backend Service:**
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- All environment variables added

**AI Service:**
- Root Directory: `ai-service`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- All environment variables added

---

## 🚀 Quick Fix

The most common issue is **missing Root Directory**. 

**Set it to `backend`** and redeploy!

---

Need help? Check the logs and let me know what error you see! 🔍
