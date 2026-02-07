// Configuration - Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const BASE_URL = isProduction ? window.location.origin : 'http://localhost:3000';

const CONFIG = {
    API_URL: `${BASE_URL}/api`,
    SOCKET_URL: BASE_URL,
    ICE_SERVERS: [
        // Google STUN servers (free, reliable)
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        
        // OpenRelay FREE TURN servers (works across different networks)
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        
        // Additional free STUN servers for redundancy
        { urls: 'stun:stun.relay.metered.ca:80' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        { urls: 'stun:stun.services.mozilla.com' }
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
    typingTimeout: null,
    // Screen sharing
    isScreenSharing: false,
    cameraStream: null,
    // Groups
    groups: [],
    currentGroup: null,
    groupMessages: new Map() // groupId -> messages array
};
