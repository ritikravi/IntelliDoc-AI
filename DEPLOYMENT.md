# IntelliDoc AI - Deployment Guide

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificates ready
- [ ] Domain names configured
- [ ] Monitoring setup
- [ ] Error tracking enabled

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare for Deployment

```bash
cd frontend

# Build production bundle
npm run build

# Test production build locally
npm run preview
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: GitHub Integration**
1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.com/api/v1
   VITE_AI_SERVICE_URL=https://your-ai-service.com
   VITE_WS_URL=wss://your-backend.com
   ```
6. Deploy

### Step 3: Configure Custom Domain
1. Add domain in Vercel dashboard
2. Update DNS records
3. Enable HTTPS

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Repository

```bash
# Ensure package.json has start script
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Step 2: Deploy to Render

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Name: `intellidoc-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Starter` (or higher)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   REDIS_URL=redis://...
   JWT_SECRET=your-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   GEMINI_API_KEY=your-key
   CLOUDINARY_CLOUD_NAME=your-cloud
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   AI_SERVICE_URL=https://your-ai-service.com
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

6. Deploy

### Alternative: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NODE_ENV=production

# Deploy
railway up
```

---

## 🤖 AI Service Deployment (Render)

### Step 1: Prepare for Deployment

```bash
cd ai-service

# Test locally
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 2: Create Dockerfile (if not using existing)

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]
```

### Step 3: Deploy to Render

1. Create new Web Service
2. Connect repository
3. Configure:
   - Name: `intellidoc-ai-service`
   - Environment: `Docker`
   - Instance Type: `Standard` (needs more resources)

4. Add Environment Variables:
   ```
   AI_SERVICE_PORT=8000
   GEMINI_API_KEY=your-key
   MONGODB_URI=mongodb+srv://...
   REDIS_URL=redis://...
   OCR_ENGINE=paddleocr
   CONFIDENCE_THRESHOLD=0.7
   ```

5. Deploy

---

## 💾 Database Deployment

### MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster (M10+ for production)
3. Configure:
   - Region: Choose closest to your backend
   - Cluster Tier: M10 or higher
   - Backup: Enable continuous backups
4. Create database user
5. Whitelist IPs:
   - Add Render/Railway IPs
   - Or use 0.0.0.0/0 (less secure)
6. Get connection string
7. Add to backend environment variables

### Redis Cloud

1. Go to https://redis.com/try-free/
2. Create database
3. Get connection URL
4. Add to backend environment variables

---

## 📦 Docker Deployment

### Build and Push Images

```bash
# Build images
docker-compose build

# Tag images
docker tag intellidoc-frontend:latest your-registry/intellidoc-frontend:latest
docker tag intellidoc-backend:latest your-registry/intellidoc-backend:latest
docker tag intellidoc-ai:latest your-registry/intellidoc-ai:latest

# Push to registry
docker push your-registry/intellidoc-frontend:latest
docker push your-registry/intellidoc-backend:latest
docker push your-registry/intellidoc-ai:latest
```

### Deploy to Cloud Provider

**AWS ECS / Google Cloud Run / Azure Container Instances**

1. Create container service
2. Pull images from registry
3. Configure environment variables
4. Set up load balancer
5. Configure auto-scaling
6. Enable monitoring

---

## 🔐 SSL/HTTPS Setup

### Vercel (Automatic)
- SSL automatically provisioned
- No configuration needed

### Render (Automatic)
- SSL automatically provisioned
- Custom domains supported

### Manual Setup (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 📊 Monitoring Setup

### Application Monitoring

**Sentry (Error Tracking)**
```bash
npm install @sentry/node @sentry/react

# Add to backend
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });

# Add to frontend
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: process.env.VITE_SENTRY_DSN });
```

**LogRocket (Session Replay)**
```bash
npm install logrocket

# Add to frontend
import LogRocket from 'logrocket';
LogRocket.init('your-app-id');
```

### Infrastructure Monitoring

**Render Dashboard**
- CPU usage
- Memory usage
- Request metrics
- Error rates

**Custom Monitoring**
```javascript
// Add to backend
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  });
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd backend
          npm install
          npm test
```

---

## 🧪 Post-Deployment Testing

### Smoke Tests

```bash
# Test frontend
curl https://your-frontend.vercel.app

# Test backend health
curl https://your-backend.com/health

# Test AI service
curl https://your-ai-service.com/health

# Test authentication
curl -X POST https://your-backend.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

**Backend:**
- Add more Render instances
- Use load balancer
- Enable auto-scaling

**AI Service:**
- Deploy multiple instances
- Use queue system (Bull/BullMQ)
- Distribute processing

### Vertical Scaling

- Upgrade instance types
- Add more RAM
- Use GPU instances for AI

### Database Scaling

- MongoDB sharding
- Read replicas
- Connection pooling

---

## 🔧 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

**Environment Variables:**
```bash
# Verify all variables are set
printenv | grep VITE_
```

**Database Connection:**
```bash
# Test MongoDB connection
mongosh "mongodb+srv://..."
```

**CORS Errors:**
```javascript
// Update CORS_ORIGIN in backend
CORS_ORIGIN=https://your-frontend.vercel.app
```

---

## 📝 Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render/Railway
- [ ] AI Service deployed
- [ ] MongoDB Atlas configured
- [ ] Redis Cloud configured
- [ ] Environment variables set
- [ ] SSL/HTTPS enabled
- [ ] Custom domains configured
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] Backups configured
- [ ] Load testing completed
- [ ] Documentation updated

---

## 🎉 Success!

Your IntelliDoc AI platform is now live and ready for production use!

**Next Steps:**
1. Monitor application performance
2. Gather user feedback
3. Iterate and improve
4. Scale as needed

---

**Deployment Support:**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
