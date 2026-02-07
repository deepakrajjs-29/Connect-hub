// Configuration - Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const BASE_URL = isProduction ? window.location.origin : 'http://localhost:3000';

const CONFIG = {
    API_URL: `${BASE_URL}/api`,
    SOCKET_URL: BASE_URL,
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
    typingTimeout: null,
    // Screen sharing
    isScreenSharing: false,
    cameraStream: null,
    // Groups
    groups: [],
    currentGroup: null,
    groupMessages: new Map() // groupId -> messages array
};
