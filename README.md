# 🎮 ConnectHub - Real-Time Communication Platform

<div align="center">

![Version](https://img.shields.io/badge/Version-2.0.0-blue) ![Node](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

**A complete Discord-like web application with real-time video calling, voice chat, and messaging**

[Features](#-features) • [Quick Start](#-quick-start) • [Usage](#-usage-guide) • [Tech Stack](#️-tech-stack) • [Deployment](#-deployment)

</div>

---

## ✨ Features

### 🔐 **Real Authentication System**
- JWT-based authentication with secure password hashing (bcrypt)
- User registration with custom avatar selection
- Session persistence with token validation
- Secure API endpoints with middleware protection

### 👥 **Friend Management**
- Search users by username or email
- Send and receive friend requests
- Accept/reject friend requests
- Real-time friend status updates (online/offline)
- Comprehensive friends list management

### 💬 **Real-Time Messaging**
- One-on-one chat with friends
- Instant message delivery via Socket.IO
- Typing indicators - see when friends are typing
- Complete message history per conversation
- Online/offline status indicators
- Message timestamps

### 🎥 **WebRTC Video Calling**
- Peer-to-peer video calls with real camera access
- High-quality video streaming
- Real-time signaling through Socket.IO
- ICE candidate exchange for NAT traversal
- **Call controls:**
  - Mute/Unmute microphone
  - Enable/Disable camera
  - End call
- Incoming call notifications with accept/reject
- Call duration timer

### 🎙️ **Voice Calls**
- Audio-only calls for voice chat
- Low-latency audio streaming
- Same WebRTC infrastructure as video calls
- Crystal-clear audio quality

---

## 🛠️ Tech Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **UUID** - Unique ID generation
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **Vanilla JavaScript** - Pure ES6+ (no frameworks)
- **Socket.IO Client** - Real-time communication
- **WebRTC APIs** - Video/voice calling

### **Real-Time Features**
- **WebSocket** connections via Socket.IO
- **WebRTC** for peer-to-peer media streaming
- **STUN servers** for NAT traversal

---

## 📁 Project Structure

```
ConnectHub/
│
├── server/
│   ├── server.js                 # Main Express server
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── users.js             # User management routes
│   └── socket/
│       └── socketHandlers.js    # Socket.IO event handlers
│
├── public/
│   ├── index.html               # Main HTML file
│   ├── css/
│   │   ├── styles.css           # Main stylesheet
│   │   └── additional-styles.css # Additional styles
│   └── js/
│       ├── config.js            # Configuration & state
│       ├── api.js               # API helper functions
│       ├── socket.js            # Socket.IO client
│       ├── webrtc.js            # WebRTC manager
│       ├── ui.js                # UI manager
│       └── app-main.js          # Main app controller
│
├── .env                         # Environment variables
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### **Installation**

1. **Navigate to the project directory:**
   ```bash
   cd c:\Users\Deepak\Desktop\Discord
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - The `.env` file is already configured with default values
   - For production, change `JWT_SECRET` to a secure random string

4. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to: `http://localhost:3000`
   - The application is now running! 🎉

---

## 📖 Usage Guide

### **First Time Setup**

#### 1. Create an Account
- Click **"Sign Up"**
- Enter your username, email, and password
- Choose an avatar from the grid
- Click **"Create Account"**

#### 2. Login
- Enter your email and password
- Click **"Log In"**
- You'll be redirected to the main app

### **Adding Friends**

#### 1. Search for Users
- Click **"Add Friend"** in the sidebar
- Enter a username or email in the search box
- Click **"Search"**

#### 2. Send Friend Request
- Click **"Add Friend"** button next to a user in search results

#### 3. Accept Requests
- Click **"Pending"** in the sidebar
- Click **"Accept"** or **"Decline"** for each request

### **Chatting**

#### 1. Start a Conversation
- Click **"All Friends"** in the sidebar
- Click the message icon next to a friend's name

#### 2. Send Messages
- Type your message in the input box
- Press **Enter** to send
- Press **Shift+Enter** for a new line

#### 3. Typing Indicators
- When your friend is typing, you'll see a typing indicator below the chat

### **Video/Voice Calls**

#### 1. Start a Call
- Open a chat with a friend
- Click the **video camera icon** (video call) or **phone icon** (voice call)
- Allow camera/microphone access when prompted by your browser

#### 2. Answer a Call
- When you receive a call, a modal will appear
- Click **"Accept"** to join or **"Decline"** to reject

#### 3. During a Call
- Click **microphone icon** to mute/unmute
- Click **camera icon** to turn video on/off (video calls only)
- Click **red power button** to end the call

---

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### **Users**
- `GET /api/users/search?query=...` - Search users
- `POST /api/users/friend-request` - Send friend request
- `POST /api/users/friend-request/accept` - Accept friend request
- `POST /api/users/friend-request/reject` - Reject friend request
- `GET /api/users/friends` - Get friends list
- `GET /api/users/friend-requests` - Get pending requests

---

## 🔌 Socket.IO Events

### **Client → Server**
- `send-message` - Send a message
- `typing` - Send typing indicator
- `call-user` - Initiate a call
- `answer-call` - Answer a call
- `reject-call` - Reject a call
- `end-call` - End a call
- `ice-candidate` - Send ICE candidate

### **Server → Client**
- `connected` - Connection established
- `receive-message` - Receive a message
- `user-typing` - Friend is typing
- `friend-status-change` - Friend status changed
- `incoming-call` - Incoming call notification
- `call-answered` - Call was answered
- `call-rejected` - Call was rejected
- `call-ended` - Call was ended
- `ice-candidate` - Receive ICE candidate

---

## 🎨 Customization

### **Change Colors**
Edit `public/css/styles.css`:
```css
:root {
    --accent-primary: #667eea;  /* Your color */
    --accent-secondary: #764ba2; /* Your color */
}
```

### **Change Port**
Edit `.env`:
```
PORT=3000  # Change to your preferred port
```

### **Change JWT Secret**
Edit `.env`:
```
JWT_SECRET=your-super-secret-key-here
```

---

## 🔒 Security Notes

### **Current Implementation**
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens for authentication
- CORS enabled for local development
- In-memory user storage (not persistent)

### **For Production**
1. ✅ **Use a real database** (MongoDB, PostgreSQL, etc.)
2. ✅ **Change JWT_SECRET** to a strong random string
3. ✅ **Enable HTTPS** for secure WebRTC
4. ✅ **Add rate limiting** to prevent abuse
5. ✅ **Implement proper CORS** configuration
6. ✅ **Add input validation** and sanitization
7. ✅ **Use environment variables** for all secrets
8. ✅ **Add TURN servers** for better WebRTC connectivity

---

## 🌐 WebRTC Configuration

### **STUN Servers**
Currently using Google's public STUN servers:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

### **For Production**
Add TURN servers in `public/js/config.js`:
```javascript
ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
        urls: 'turn:your-turn-server.com:3478',
        username: 'username',
        credential: 'password'
    }
]
```

---

## 📱 Browser Compatibility

### **Fully Supported**
- ✅ Chrome 90+ (Desktop & Android)
- ✅ Firefox 88+ (Desktop & Android)
- ✅ Edge 90+ (Desktop)
- ✅ Safari 14+ (Desktop & iOS)

### **Requirements**
- **HTTPS or localhost** for WebRTC
- **Camera/microphone permissions** for calls
- **WebSocket support** for real-time features

---

## 🐛 Troubleshooting

### **Server won't start**
- Check if port 3000 is already in use
- Run `npm install` to ensure dependencies are installed
- Check `.env` file exists

### **Can't connect to server**
- Ensure server is running (`npm start`)
- Check firewall settings
- Verify you're accessing `http://localhost:3000`

### **Video/Audio not working**
- Allow camera/microphone permissions in browser
- Use HTTPS or localhost
- Check if another app is using camera/mic
- Try a different browser

### **Messages not sending**
- Check browser console for errors
- Ensure you're logged in
- Verify Socket.IO connection (check console logs)

### **Friend requests not working**
- Ensure both users are registered
- Check network tab for API errors
- Verify JWT token is valid

---

## 🚀 Deployment

### **Deploy to Heroku**
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
git push heroku main
```

### **Deploy to Railway**
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### **Deploy to Render**
1. Create new Web Service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm start`

---

## 📊 Performance

### **Current Limitations**
- **In-memory storage** - Data lost on server restart
- **No database** - Not suitable for production
- **Single server** - No horizontal scaling
- **No caching** - Every request hits the server

### **Recommended Improvements**
1. Add Redis for session storage
2. Use PostgreSQL/MongoDB for data persistence
3. Implement caching layer
4. Add load balancing
5. Use CDN for static assets

---

## 🤝 Contributing

This is a demonstration project. Feel free to fork and modify for your needs!

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🙏 Acknowledgments

- **Socket.IO** - Real-time communication
- **WebRTC** - Peer-to-peer media streaming
- **Express.js** - Web framework
- **DiceBear** - Avatar generation API
- **Google Fonts** - Inter font family

---

<div align="center">

**Built with ❤️ using Node.js, Express, Socket.IO, and WebRTC**

*A complete full-stack real-time communication platform*

</div>
