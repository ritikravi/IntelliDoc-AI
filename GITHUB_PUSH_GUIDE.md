# 🚀 Push to GitHub - Quick Guide

## ⚠️ Authentication Issue

You need to authenticate with GitHub. Here's how:

---

## 🔑 Option 1: Using Personal Access Token (Recommended)

### **Step 1: Create Personal Access Token**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "IntelliDoc AI"
4. Select scopes:
   - ✅ `repo` (all)
   - ✅ `workflow`
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### **Step 2: Push with Token**

```bash
# Remove old remote
git remote remove origin

# Add remote with token
git remote add origin https://YOUR_TOKEN@github.com/ritikravi/IntelliDoc-AI-.git

# Push
git push -u origin main
```

Replace `YOUR_TOKEN` with the token you copied.

---

## 🔑 Option 2: Using SSH (Better for Long-term)

### **Step 1: Generate SSH Key**

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter for default location
# Press Enter for no passphrase (or set one)

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

### **Step 2: Add to GitHub**

1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Paste your public key
4. Click "Add SSH key"

### **Step 3: Push with SSH**

```bash
# Remove old remote
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:ritikravi/IntelliDoc-AI-.git

# Push
git push -u origin main
```

---

## 🔑 Option 3: Using GitHub CLI (Easiest)

```bash
# Install GitHub CLI (if not installed)
brew install gh  # macOS
# or download from: https://cli.github.com/

# Login
gh auth login

# Follow prompts and select HTTPS

# Push
git push -u origin main
```

---

## ✅ After Successful Push

Once pushed, you can:

1. **View on GitHub:** https://github.com/ritikravi/IntelliDoc-AI-

2. **Deploy Frontend from GitHub:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import from GitHub
   - Select "IntelliDoc-AI-"
   - Root Directory: `frontend`
   - Deploy!

3. **Deploy Backend from GitHub:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub
   - Select repository
   - Root Directory: `backend`
   - Deploy!

---

## 🚀 Quick Commands

After setting up authentication:

```bash
# Check remote
git remote -v

# Push to GitHub
git push -u origin main

# Check status
git status
```

---

## 🐛 Troubleshooting

### **"Permission denied"**
- Use Personal Access Token (Option 1)
- Or set up SSH keys (Option 2)

### **"Repository not found"**
- Make sure repository exists on GitHub
- Check repository name is correct
- Verify you have access

### **"Authentication failed"**
- Token might be expired
- Generate new token
- Or use SSH instead

---

## 💡 Recommended Approach

**For now, use Option 1 (Personal Access Token):**

1. Create token: https://github.com/settings/tokens
2. Copy token
3. Run:
   ```bash
   git remote remove origin
   git remote add origin https://YOUR_TOKEN@github.com/ritikravi/IntelliDoc-AI-.git
   git push -u origin main
   ```

**Done!** Your code will be on GitHub and ready to deploy.

---

## 📞 Need Help?

If you're still having issues:
1. Make sure you're logged into the correct GitHub account
2. Verify the repository exists
3. Check you have write access to the repository

---

**Once pushed, come back and we'll deploy everything! 🚀**
