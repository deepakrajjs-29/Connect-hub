// Main Application Controller
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Check for existing session
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const { user } = await API.verifyToken(token);
            AppState.currentUser = user;
            AppState.token = token;
            
            // Connect to socket
            SocketManager.connect();
            
            // Load friends data
            await UI.loadFriendsData();
            
            // Show app screen
            UI.updateUserProfile(user);
            UI.showAppScreen();
            UI.switchView('all-friends');
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            UI.showAuthScreen();
        }
    } else {
        UI.showAuthScreen();
    }

    setupEventListeners();
}

function setupEventListeners() {
    // Auth form switching
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
        e.preventDefault();
        UI.showSignupForm();
        UI.generateAvatarGrid();
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        UI.showLoginForm();
    });

    // Login
    document.getElementById('login-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        errorDiv.textContent = '';

        if (!email || !password) {
            errorDiv.textContent = 'Please fill in all fields';
            return;
        }

        try {
            const { token, user } = await API.login(email, password);
            
            // Store token
            localStorage.setItem('token', token);
            AppState.token = token;
            AppState.currentUser = user;

            // Connect to socket
            SocketManager.connect();

            // Load friends data
            await UI.loadFriendsData();

            // Show app
            UI.updateUserProfile(user);
            UI.showAppScreen();
            UI.switchView('all-friends');

        } catch (error) {
            errorDiv.textContent = error.message;
        }
    });

    // Signup
    document.getElementById('signup-btn')?.addEventListener('click', async () => {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const avatar = document.getElementById('selected-avatar').value;
        const errorDiv = document.getElementById('signup-error');

        errorDiv.textContent = '';

        if (!username || !email || !password) {
            errorDiv.textContent = 'Please fill in all fields';
            return;
        }

        if (!avatar) {
            errorDiv.textContent = 'Please select an avatar';
            return;
        }

        try {
            const { token, user } = await API.register(username, email, password, avatar);
            
            // Store token
            localStorage.setItem('token', token);
            AppState.token = token;
            AppState.currentUser = user;

            // Connect to socket
            SocketManager.connect();

            // Load friends data
            await UI.loadFriendsData();

            // Show app
            UI.updateUserProfile(user);
            UI.showAppScreen();
            UI.switchView('all-friends');

        } catch (error) {
            errorDiv.textContent = error.message;
        }
    });

    // Enter key for login
    document.getElementById('login-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('login-btn').click();
        }
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            // Disconnect socket
            SocketManager.disconnect();

            // Clear state
            localStorage.removeItem('token');
            AppState.currentUser = null;
            AppState.token = null;
            AppState.friends = [];
            AppState.friendRequests = [];
            AppState.messages.clear();

            // Show auth screen
            UI.showAuthScreen();
            UI.showLoginForm();
        }
    });

    // View switching
    document.querySelectorAll('.channel-item[data-view]').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            AppState.currentView = view;
            UI.switchView(view);

            if (view === 'all-friends') {
                UI.renderFriendsList();
            } else if (view === 'pending') {
                UI.renderPendingRequests();
            }
        });
    });

    // Refresh friends
    document.getElementById('refresh-friends-btn')?.addEventListener('click', async () => {
        await UI.loadFriendsData();
        UI.showNotification('Friends list refreshed', '', 'success');
    });

    // Search users
    document.getElementById('search-users-btn')?.addEventListener('click', () => {
        const query = document.getElementById('friend-search').value.trim();
        if (query) {
            UI.searchUsers(query);
        }
    });

    document.getElementById('friend-search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('search-users-btn').click();
        }
    });

    // Message input
    const messageInput = document.getElementById('message-input');
    
    messageInput?.addEventListener('input', (e) => {
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';

        // Handle typing indicator
        UI.handleTyping();
    });

    messageInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            UI.sendMessage();
        }
    });

    document.getElementById('send-message-btn')?.addEventListener('click', () => {
        UI.sendMessage();
    });

    // Voice call
    document.getElementById('voice-call-btn')?.addEventListener('click', () => {
        if (AppState.currentChatFriend) {
            WebRTCManager.initializeCall(AppState.currentChatFriend.id, 'voice');
        }
    });

    // Video call
    document.getElementById('video-call-btn')?.addEventListener('click', () => {
        if (AppState.currentChatFriend) {
            WebRTCManager.initializeCall(AppState.currentChatFriend.id, 'video');
        }
    });

    // Call controls
    document.getElementById('toggle-mic-btn')?.addEventListener('click', (e) => {
        const enabled = WebRTCManager.toggleMicrophone();
        e.currentTarget.classList.toggle('muted', !enabled);
        e.currentTarget.title = enabled ? 'Mute' : 'Unmute';
    });

    document.getElementById('toggle-camera-btn')?.addEventListener('click', (e) => {
        const enabled = WebRTCManager.toggleCamera();
        e.currentTarget.classList.toggle('camera-off', !enabled);
        e.currentTarget.title = enabled ? 'Turn off camera' : 'Turn on camera';
    });

    document.getElementById('toggle-screen-btn')?.addEventListener('click', (e) => {
        const isSharing = WebRTCManager.toggleScreenShare();
        e.currentTarget.classList.toggle('active', isSharing);
        e.currentTarget.title = isSharing ? 'Stop Sharing' : 'Share Screen';
    });

    document.getElementById('end-call-btn')?.addEventListener('click', () => {
        WebRTCManager.endCall();
    });

    // Incoming call
    document.getElementById('accept-call-btn')?.addEventListener('click', () => {
        WebRTCManager.acceptCall();
    });

    document.getElementById('reject-call-btn')?.addEventListener('click', () => {
        WebRTCManager.rejectCall();
    });

    // --- GROUP CREATION LOGIC ---
    const createGroupModal = document.getElementById('create-group-modal');
    const closeGroupModal = createGroupModal?.querySelector('.close-modal');
    // Using the same server add button (+ button)
    const addServerBtn = document.getElementById('add-server-btn'); 
    const confirmCreateGroupBtn = document.getElementById('create-group-confirm-btn');

    if (addServerBtn && createGroupModal) {
        addServerBtn.addEventListener('click', () => {
            createGroupModal.style.display = 'block';
            populateGroupMembers();
        });
    }

    if (closeGroupModal) {
        closeGroupModal.addEventListener('click', () => {
             createGroupModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === createGroupModal) {
            createGroupModal.style.display = 'none';
        }
    });

    function populateGroupMembers() {
        const list = document.getElementById('group-members-list');
        if (!list) return;
        list.innerHTML = '';
        
        AppState.friends.forEach(friend => {
            const div = document.createElement('div');
            // Checkbox for each friend
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `friend-${friend.id}`;
            checkbox.value = friend.id;

            const label = document.createElement('label');
            label.htmlFor = `friend-${friend.id}`;
            label.textContent = friend.username;
            label.style.marginLeft = '8px';

            div.appendChild(checkbox);
            div.appendChild(label);
            list.appendChild(div);
        });
    }

    if (confirmCreateGroupBtn) {
        confirmCreateGroupBtn.addEventListener('click', async () => {
            const nameInput = document.getElementById('group-name-input');
            const name = nameInput.value.trim();
            
            if (!name) {
                alert('Please enter a group name');
                return;
            }

            const list = document.getElementById('group-members-list');
            const selectedMembers = Array.from(list.querySelectorAll('input:checked'))
                .map(cb => cb.value);

            try {
                await API.createGroup(name, selectedMembers);
                createGroupModal.style.display = 'none';
                nameInput.value = '';
                alert('Group created successfully!');
                //Ideally, refresh group list here
            } catch (error) {
                console.error('Failed to create group:', error);
                alert('Error creating group');
            }
        });
    }
}

// Make UI functions globally accessible for onclick handlers
window.UI = UI;
