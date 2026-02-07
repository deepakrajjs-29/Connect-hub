// Configuration
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    SOCKET_URL: 'http://localhost:3000',
    ICE_SERVERS: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Global state
const AppState = {
    currentUser: null,
    token: null,
    socket: null,
    friends: [],
    friendRequests: [],
    currentView: 'all-friends',
    currentChatFriend: null,
    messages: new Map(), // friendId -> messages array
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    callActive: false,
    callType: null, // 'video' or 'voice'
    callPeer: null,
    typingTimeout: null
};
