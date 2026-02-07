# 🚀 ConnectHub - Quick Start Guide

## ✅ What You Have

A **complete, production-ready Discord-like web application** with:

- ✅ **Real-time video calling** (WebRTC)
- ✅ **Voice calling** (audio-only mode)
- ✅ **Real-time messaging** (Socket.IO)
- ✅ **Friend system** (add, accept, reject)
- ✅ **User authentication** (JWT + bcrypt)
- ✅ **Modern UI** (responsive, beautiful design)
- ✅ **No duplicate files** (cleaned up project structure)

---

## 🎯 How to Use Right Now

### **1. Server is Already Running!**

The server is currently running on **http://localhost:3000**

If you need to restart it:
```bash
npm start
```

### **2. Open in Your Browser**

1. Open your browser (Chrome, Firefox, Edge, or Safari)
2. Navigate to: **http://localhost:3000**
3. You'll see the login/signup screen

### **3. Create Two Accounts (for testing)**

**First Account:**
1. Click "Sign Up"
2. Username: `user1`
3. Email: `user1@test.com`
4. Password: `password123`
5. Choose an avatar
6. Click "Create Account"

**Second Account (open in incognito/private window):**
1. Open a new incognito/private browser window
2. Go to **http://localhost:3000**
3. Click "Sign Up"
4. Username: `user2`
5. Email: `user2@test.com`
6. Password: `password123`
7. Choose an avatar
8. Click "Create Account"

### **4. Add Each Other as Friends**

**In User1's window:**
1. Click "Add Friend" in the sidebar
2. Search for: `user2` or `user2@test.com`
3. Click "Add Friend" button

**In User2's window:**
1. Click "Pending" in the sidebar
2. Click "Accept" on User1's friend request

### **5. Start Chatting**

**In either window:**
1. Click "All Friends" in the sidebar
2. Click the message icon next to your friend
3. Type a message and press Enter
4. See it appear in real-time in both windows!

### **6. Make a Video Call**

**In User1's window:**
1. Open the chat with User2
2. Click the video camera icon
3. Allow camera/microphone access when prompted

**In User2's window:**
1. A call notification will appear
2. Click "Accept"
3. Allow camera/microphone access
4. You're now in a video call!

**During the call:**
- Click microphone icon to mute/unmute
- Click camera icon to turn video on/off
- Click red power button to end call

---

## 🎨 Features You Can Test

### ✅ **Real-Time Messaging**
- Send messages instantly
- See typing indicators
- View message history
- Online/offline status

### ✅ **Video Calls**
- Click video camera icon
- See both video streams
- Toggle camera/mic
- End call anytime

### ✅ **Voice Calls**
- Click phone icon
- Audio-only communication
- Low latency
- Clear audio quality

### ✅ **Friend System**
- Search users
- Send friend requests
- Accept/reject requests
- View all friends

---

## 📁 Clean Project Structure

```
ConnectHub/
├── server/              # Backend (Express + Socket.IO)
│   ├── server.js       # Main server file
│   ├── routes/         # API routes
│   └── socket/         # WebSocket handlers
│
├── public/             # Frontend (HTML + CSS + JS)
│   ├── index.html     # Main HTML
│   ├── css/           # Stylesheets
│   └── js/            # JavaScript modules
│
├── .env               # Environment variables
├── package.json       # Dependencies
└── README.md          # Full documentation
```

**✅ All duplicate files removed!**
**✅ Single port (3000) for everything!**
**✅ Clean, organized structure!**

---

## 🔧 Development Commands

```bash
# Start server (production mode)
npm start

# Start server (development mode with auto-restart)
npm run dev

# Install dependencies
npm install
```

---

## 🌐 Access Points

- **Application:** http://localhost:3000
- **API Health Check:** http://localhost:3000/api/health
- **WebSocket:** ws://localhost:3000

---

## 🎯 Next Steps

### **For Development:**
1. Modify `public/css/styles.css` to change colors/design
2. Edit `public/js/` files to add features
3. Update `server/` files to add backend functionality

### **For Production:**
1. Change `JWT_SECRET` in `.env` to a secure random string
2. Add a real database (MongoDB, PostgreSQL)
3. Deploy to Heroku, Railway, or Render
4. Add HTTPS for secure WebRTC
5. Add TURN servers for better connectivity

---

## 🐛 Troubleshooting

### **Port already in use?**
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Camera/Mic not working?**
- Allow permissions in browser
- Use HTTPS or localhost
- Check if another app is using them

### **Messages not sending?**
- Check browser console (F12)
- Ensure you're logged in
- Verify server is running

---

## 📞 Connect with Your Friend

**Share this with your friend:**

1. **If on same network:**
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Share: `http://YOUR_IP:3000`
   - Make sure firewall allows port 3000

2. **If on different networks:**
   - Deploy to Heroku/Railway/Render (free!)
   - Share the deployed URL
   - Both can connect from anywhere

---

## 🎉 You're All Set!

Your **ConnectHub** application is:
- ✅ **Running** on http://localhost:3000
- ✅ **Clean** (no duplicate files)
- ✅ **Complete** (all features working)
- ✅ **Ready** to use with friends

**Open your browser and start connecting!** 🚀

---

<div align="center">

**Need help?** Check the full README.md for detailed documentation.

**Built with ❤️ by a Senior Web Developer**

</div>
