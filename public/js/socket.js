// Socket.IO Connection and Event Handlers
const SocketManager = {
    connect() {
        if (!AppState.token) {
            console.error('No token available for socket connection');
            return;
        }

        AppState.socket = io(CONFIG.SOCKET_URL, {
            auth: {
                token: AppState.token
            }
        });

        this.setupEventListeners();
    },

    setupEventListeners() {
        const socket = AppState.socket;

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Connected to server');
        });

        socket.on('connected', (data) => {
            console.log('Connected as:', data.username);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
        });

        // Message events
        socket.on('receive-message', (data) => {
            this.handleIncomingMessage(data);
        });

        socket.on('message-sent', (data) => {
            console.log('Message sent:', data);
        });

        socket.on('user-typing', (data) => {
            this.handleTypingIndicator(data);
        });

        // Friend status events
        socket.on('friend-status-change', (data) => {
            this.handleFriendStatusChange(data);
        });

        // Call events
        socket.on('incoming-call', (data) => {
            WebRTCManager.handleIncomingCall(data);
        });

        socket.on('call-answered', (data) => {
            WebRTCManager.handleCallAnswered(data);
        });

        socket.on('call-rejected', (data) => {
            WebRTCManager.handleCallRejected(data);
        });

        socket.on('call-ended', (data) => {
            WebRTCManager.handleCallEnded(data);
        });

        socket.on('ice-candidate', (data) => {
            WebRTCManager.handleICECandidate(data);
        });
    },

    sendMessage(recipientId, message) {
        if (!AppState.socket) {
            console.error('Socket not connected');
            return;
        }

        AppState.socket.emit('send-message', {
            recipientId,
            message,
            timestamp: new Date().toISOString()
        });
    },

    sendTyping(recipientId, isTyping) {
        if (!AppState.socket) return;

        AppState.socket.emit('typing', {
            recipientId,
            isTyping
        });
    },

    handleIncomingMessage(data) {
        const { from, fromUsername, message, timestamp, type } = data;

        // Store message
        if (!AppState.messages.has(from)) {
            AppState.messages.set(from, []);
        }

        AppState.messages.get(from).push({
            from,
            fromUsername,
            message,
            timestamp,
            type: 'received',
            messageType: type || 'text'
        });

        // Update UI if chat is open with this friend
        if (AppState.currentChatFriend?.id === from) {
            UI.renderMessages(from);
        }

        // Show notification if chat is not open
        if (AppState.currentChatFriend?.id !== from) {
            UI.showNotification(`New message from ${fromUsername}`, message);
        }
    },

    handleTypingIndicator(data) {
        const { userId, username, isTyping } = data;

        if (AppState.currentChatFriend?.id === userId) {
            const typingIndicator = document.getElementById('typing-indicator');
            const typingUsername = document.getElementById('typing-username');

            if (isTyping) {
                typingUsername.textContent = username;
                typingIndicator.style.display = 'block';
            } else {
                typingIndicator.style.display = 'none';
            }
        }
    },

    handleFriendStatusChange(data) {
        const { userId, username, status } = data;

        // Update friend status in state
        const friend = AppState.friends.find(f => f.id === userId);
        if (friend) {
            friend.status = status;
        }

        // Update UI
        UI.updateFriendStatus(userId, status);

        // Show notification
        if (status === 'online') {
            UI.showNotification(`${username} is now online`, '', 'success');
        }
    },

    disconnect() {
        if (AppState.socket) {
            AppState.socket.disconnect();
            AppState.socket = null;
        }
    }
};
