# 🚀 Deploy to Render - Complete Guide

## ✅ **Code is Ready on GitHub!**

Your repository: **https://github.com/deepakrajjs-29/Connect-hub**

Now let's deploy it online so your friend can access it!

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Go to Render**
1. Open browser: **https://render.com**
2. Click **"Get Started"** or **"Sign Up"**

### **Step 2: Sign Up with GitHub**
1. Click **"Sign up with GitHub"**
2. Authorize Render to access your GitHub
3. You'll be redirected to Render dashboard

### **Step 3: Create New Web Service**
1. Click **"New +"** (top right)
2. Select **"Web Service"**

### **Step 4: Connect Repository**
1. Find **"Connect-hub"** in the list
2. Click **"Connect"**
3. If you don't see it:
   - Click **"Configure account"**
   - Give Render access to all repositories or just Connect-hub

### **Step 5: Configure Service**

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `connecthub` (or any name) |
| **Region** | Choose closest (Singapore/Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | Leave blank |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### **Step 6: Add Environment Variables**

Scroll to **"Environment Variables"** and click **"Add Environment Variable"**

Add these **3 variables**:

#### **Variable 1:**
- **Key:** `JWT_SECRET`
- **Value:** `ConnectHub-Super-Secret-Key-2024-Change-This`

#### **Variable 2:**
- **Key:** `NODE_ENV`
- **Value:** `production`

#### **Variable 3:**
- **Key:** `PORT`
- **Value:** `3000`

### **Step 7: Deploy!**
1. Click **"Create Web Service"** (bottom)
2. Wait 2-3 minutes for build
3. Watch the logs for progress

### **Step 8: Get Your URL**
1. Once deployed: **"Your service is live 🎉"**
2. Your URL: `https://connecthub-xxxx.onrender.com`
3. Click to open!

---

## 🎉 **Share with Your Friend**

Send this message:

```
Hey! Check out my video chat app:
https://connecthub-xxxx.onrender.com

How to use:
1. Create an account (choose username, email, password, avatar)
2. Click "Add Friend" and search for my username: YOUR_USERNAME
3. Send friend request
4. I'll accept it
5. Click "All Friends" → Message icon to chat
6. Click video icon for video call!
```

---

## ⚠️ **Important Notes**

### **Free Tier Limitations:**
- App sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month free (enough for testing)

### **Keep It Awake (Optional):**
Use **UptimeRobot** (free):
1. Go to: https://uptimerobot.com
2. Sign up free
3. Add monitor: Your Render URL
4. Check every 5 minutes
5. This keeps your app awake!

---

## 🐛 **Troubleshooting**

### **Build Failed:**
- Check logs in Render dashboard
- Make sure `package.json` has all dependencies
- Verify `npm start` command is correct

### **App Crashes:**
- Check environment variables are set
- Look at logs for errors
- Make sure PORT is set to 3000

### **Can't Connect:**
- Wait 30 seconds after first visit (waking up)
- Clear browser cache
- Try incognito mode

### **Video Calls Not Working:**
- HTTPS is required (Render provides this automatically ✅)
- Allow camera/microphone in browser
- Use Chrome for best compatibility

---

## 📊 **What Happens During Deployment**

1. Render clones your GitHub repository
2. Runs `npm install` (installs dependencies)
3. Runs `npm start` (starts server)
4. Assigns a URL: `https://connecthub-xxxx.onrender.com`
5. Provides HTTPS automatically (required for video calls)
6. Your app is live!

---

## 🔄 **Auto-Deploy (Bonus)**

Render automatically redeploys when you push to GitHub!

```powershell
# Make changes to your code
git add .
git commit -m "Your changes"
git push

# Render automatically detects and redeploys!
```

---

## ✅ **Verification Checklist**

After deployment, test:

- [ ] Can open the URL
- [ ] Can create an account
- [ ] Can login
- [ ] Can add friends
- [ ] Can send messages
- [ ] Can make video calls
- [ ] Camera/microphone work

---

## 🎯 **Expected Timeline**

- **Sign up to Render:** 2 minutes
- **Connect repository:** 1 minute
- **Configure settings:** 2 minutes
- **Build & deploy:** 2-3 minutes
- **Total:** ~8 minutes

---

## 🚀 **You're Almost There!**

Just follow the steps above and your app will be live in ~8 minutes!

Your friend can then access it from anywhere in the world! 🌍

---

**Good luck! Let me know once it's deployed!** 🎉
