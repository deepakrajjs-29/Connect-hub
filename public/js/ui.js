// UI Manager
const UI = {
    // Show/Hide screens
    showAuthScreen() {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('app-screen').style.display = 'none';
    },

    showAppScreen() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'flex';
    },

    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    },

    showSignupForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    },

    // Update user profile
    updateUserProfile(user) {
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('user-avatar').src = user.avatar;
    },

    // Generate avatar grid
    generateAvatarGrid() {
        const grid = document.getElementById('avatar-grid');
        const avatarStyles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'open-peeps'];
        
        grid.innerHTML = '';
        
        avatarStyles.forEach((style, index) => {
            const seed = `avatar-${index}`;
            const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'avatar-option';
            avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="Avatar ${index + 1}">`;
            avatarDiv.dataset.avatar = avatarUrl;
            
            avatarDiv.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
                avatarDiv.classList.add('selected');
                document.getElementById('selected-avatar').value = avatarUrl;
            });
            
            grid.appendChild(avatarDiv);
        });
    },

    // Friends list
    async renderFriendsList() {
        const container = document.getElementById('friends-list');
        container.innerHTML = '';

        if (AppState.friends.length === 0) {
            container.innerHTML = '<div class="empty-state">No friends yet. Add some friends to get started!</div>';
            return;
        }

        AppState.friends.forEach(friend => {
            const friendCard = document.createElement('div');
            friendCard.className = 'friend-card';
            friendCard.innerHTML = `
                <img src="${friend.avatar}" alt="${friend.username}" class="friend-avatar">
                <div class="friend-info">
                    <div class="friend-name">${friend.username}</div>
                    <div class="friend-status">
                        <span class="status-indicator ${friend.status}"></span>
                        <span>${friend.status || 'offline'}</span>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="icon-btn" onclick="UI.openChat('${friend.id}')" title="Message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                </div>
            `;
            container.appendChild(friendCard);
        });
    },

    // Pending requests
    async renderPendingRequests() {
        const container = document.getElementById('pending-requests-list');
        const badge = document.getElementById('pending-badge');
        
        container.innerHTML = '';

        if (AppState.friendRequests.length === 0) {
            container.innerHTML = '<div class="empty-state">No pending friend requests</div>';
            badge.style.display = 'none';
            return;
        }

        badge.textContent = AppState.friendRequests.length;
        badge.style.display = 'inline-block';

        AppState.friendRequests.forEach(request => {
            const requestCard = document.createElement('div');
            requestCard.className = 'friend-card';
            requestCard.innerHTML = `
                <img src="${request.avatar}" alt="${request.username}" class="friend-avatar">
                <div class="friend-info">
                    <div class="friend-name">${request.username}</div>
                    <div class="friend-status">Incoming Friend Request</div>
                </div>
                <div class="friend-actions">
                    <button class="btn primary small" onclick="UI.acceptFriendRequest('${request.from}')">Accept</button>
                    <button class="btn secondary small" onclick="UI.rejectFriendRequest('${request.from}')">Decline</button>
                </div>
            `;
            container.appendChild(requestCard);
        });
    },

    async acceptFriendRequest(fromUserId) {
        try {
            await API.acceptFriendRequest(fromUserId);
            await this.loadFriendsData();
            this.showNotification('Friend request accepted!', '', 'success');
        } catch (error) {
            console.error('Error accepting friend request:', error);
            alert(error.message);
        }
    },

    async rejectFriendRequest(fromUserId) {
        try {
            await API.rejectFriendRequest(fromUserId);
            await this.loadFriendsData();
            this.showNotification('Friend request declined', '', 'info');
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            alert(error.message);
        }
    },

    // Search users
    async searchUsers(query) {
        try {
            const { users } = await API.searchUsers(query);
            this.renderSearchResults(users);
        } catch (error) {
            console.error('Error searching users:', error);
            alert(error.message);
        }
    },

    renderSearchResults(users) {
        const container = document.getElementById('search-results');
        container.innerHTML = '';

        if (users.length === 0) {
            container.innerHTML = '<div class="empty-state">No users found</div>';
            return;
        }

        users.forEach(user => {
            const isFriend = AppState.friends.some(f => f.id === user.id);
            const hasPendingRequest = AppState.friendRequests.some(r => r.from === user.id);

            const userCard = document.createElement('div');
            userCard.className = 'friend-card';
            userCard.innerHTML = `
                <img src="${user.avatar}" alt="${user.username}" class="friend-avatar">
                <div class="friend-info">
                    <div class="friend-name">${user.username}</div>
                    <div class="friend-status">${user.email}</div>
                </div>
                <div class="friend-actions">
                    ${isFriend ? 
                        '<span class="status-text">Already friends</span>' :
                        hasPendingRequest ?
                        '<span class="status-text">Request pending</span>' :
                        `<button class="btn primary small" onclick="UI.sendFriendRequest('${user.id}')">Add Friend</button>`
                    }
                </div>
            `;
            container.appendChild(userCard);
        });
    },

    async sendFriendRequest(targetUserId) {
        try {
            await API.sendFriendRequest(targetUserId);
            this.showNotification('Friend request sent!', '', 'success');
            
            // Refresh search results
            const query = document.getElementById('friend-search').value;
            if (query) {
                await this.searchUsers(query);
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            alert(error.message);
        }
    },

    // Chat
    async openChat(friendId) {
        const friend = AppState.friends.find(f => f.id === friendId);
        if (!friend) return;

        AppState.currentChatFriend = friend;
        AppState.currentView = 'chat';

        // Update UI
        document.getElementById('chat-friend-name').textContent = friend.username;
        document.getElementById('chat-friend-avatar').src = friend.avatar;
        document.getElementById('chat-friend-status').textContent = friend.status || 'offline';
        document.getElementById('chat-friend-status').className = `status-text ${friend.status}`;

        // Show chat view
        this.switchView('chat');

        // Load messages from database
        try {
            const { messages } = await API.getMessages(friendId);
            
            // Convert database messages to app format
            const formattedMessages = messages.map(msg => ({
                from: msg.from_user_id,
                message: msg.message,
                timestamp: msg.timestamp,
                type: msg.from_user_id === AppState.currentUser.id ? 'sent' : 'received'
            }));

            // Store in AppState
            AppState.messages.set(friendId, formattedMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
            // Initialize empty if error
            if (!AppState.messages.has(friendId)) {
                AppState.messages.set(friendId, []);
            }
        }

        // Render messages
        this.renderMessages(friendId);

        // Focus message input
        document.getElementById('message-input').focus();
    },

    renderMessages(friendId) {
        const container = document.getElementById('messages-container');
        const messages = AppState.messages.get(friendId) || [];

        container.innerHTML = '';

        if (messages.length === 0) {
            container.innerHTML = '<div class="empty-state">No messages yet. Start the conversation!</div>';
            return;
        }

        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.type === 'sent' ? 'sent' : 'received'}`;
            
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(msg.message)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
            
            container.appendChild(messageDiv);
        });

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();

        if (!message || !AppState.currentChatFriend) return;

        const friendId = AppState.currentChatFriend.id;

        // Store message locally
        if (!AppState.messages.has(friendId)) {
            AppState.messages.set(friendId, []);
        }

        AppState.messages.get(friendId).push({
            from: AppState.currentUser.id,
            message,
            timestamp: new Date().toISOString(),
            type: 'sent'
        });

        // Send through socket
        SocketManager.sendMessage(friendId, message);

        // Update UI
        this.renderMessages(friendId);

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Stop typing indicator
        SocketManager.sendTyping(friendId, false);
    },

    handleTyping() {
        if (!AppState.currentChatFriend) return;

        const friendId = AppState.currentChatFriend.id;

        // Send typing indicator
        SocketManager.sendTyping(friendId, true);

        // Clear previous timeout
        if (AppState.typingTimeout) {
            clearTimeout(AppState.typingTimeout);
        }

        // Set timeout to stop typing indicator
        AppState.typingTimeout = setTimeout(() => {
            SocketManager.sendTyping(friendId, false);
        }, 2000);
    },

    // View switching
    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.content-view').forEach(view => {
            view.style.display = 'none';
        });

        // Show selected view
        const viewMap = {
            'all-friends': 'friends-view',
            'pending': 'pending-view',
            'add-friend': 'add-friend-view',
            'chat': 'chat-view'
        };

        const viewId = viewMap[viewName];
        if (viewId) {
            document.getElementById(viewId).style.display = 'block';
        }

        // Update active channel
        document.querySelectorAll('.channel-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeChannel = document.querySelector(`[data-view="${viewName}"]`);
        if (activeChannel) {
            activeChannel.classList.add('active');
        }
    },

    // Video call modal
    showVideoCallModal() {
        document.getElementById('video-call-modal').style.display = 'flex';
        this.startCallTimer();
    },

    hideVideoCallModal() {
        document.getElementById('video-call-modal').style.display = 'none';
        this.stopCallTimer();
        
        // Hide remote video
        document.getElementById('remote-video-container').style.display = 'none';
    },

    showIncomingCallModal(friend, callType) {
        const modal = document.getElementById('incoming-call-modal');
        document.getElementById('incoming-caller-name').textContent = friend.username;
        document.getElementById('incoming-caller-avatar').src = friend.avatar;
        document.getElementById('incoming-call-type').textContent = 
            callType === 'video' ? 'is calling you with video...' : 'is calling you...';
        
        modal.style.display = 'flex';
    },

    hideIncomingCallModal() {
        document.getElementById('incoming-call-modal').style.display = 'none';
    },

    startCallTimer() {
        let seconds = 0;
        AppState.callTimer = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('call-duration').textContent = 
                `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }, 1000);
    },

    stopCallTimer() {
        if (AppState.callTimer) {
            clearInterval(AppState.callTimer);
            AppState.callTimer = null;
        }
        document.getElementById('call-duration').textContent = '00:00';
    },

    // Update friend status
    updateFriendStatus(userId, status) {
        // Update in friends list
        const friendCards = document.querySelectorAll('.friend-card');
        friendCards.forEach(card => {
            const actions = card.querySelector('.friend-actions');
            if (actions && actions.querySelector(`[onclick*="${userId}"]`)) {
                const statusIndicator = card.querySelector('.status-indicator');
                const statusText = card.querySelector('.friend-status span:last-child');
                
                if (statusIndicator) {
                    statusIndicator.className = `status-indicator ${status}`;
                }
                if (statusText) {
                    statusText.textContent = status;
                }
            }
        });

        // Update in chat view if open
        if (AppState.currentChatFriend?.id === userId) {
            const chatStatus = document.getElementById('chat-friend-status');
            chatStatus.textContent = status;
            chatStatus.className = `status-text ${status}`;
        }
    },

    // Load friends data
    async loadFriendsData() {
        try {
            const [friendsData, requestsData] = await Promise.all([
                API.getFriends(),
                API.getFriendRequests()
            ]);

            AppState.friends = friendsData.friends;
            AppState.friendRequests = requestsData.friendRequests;

            this.renderFriendsList();
            this.renderPendingRequests();
        } catch (error) {
            console.error('Error loading friends data:', error);
        }
    },

    // Notifications
    showNotification(title, message, type = 'info') {
        // Simple console notification for now
        // You can implement a toast notification system here
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    },

    // Groups
    renderGroups() {
        const groupsList = document.getElementById('groups-list');
        if (!groupsList) return;

        groupsList.innerHTML = '';

        if (!AppState.groups || AppState.groups.length === 0) {
            groupsList.innerHTML = '<div style="padding: 10px; color: #72767d; font-size: 12px; text-align: center;">No groups yet</div>';
            return;
        }

        AppState.groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'channel-item';
            groupItem.dataset.groupId = group.id;
            groupItem.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>${this.escapeHtml(group.name)}</span>
            `;

            groupItem.addEventListener('click', () => {
                this.openGroupChat(group.id);
            });

            groupsList.appendChild(groupItem);
        });
    },

    async openGroupChat(groupId) {
        const group = AppState.groups.find(g => g.id === groupId);
        if (!group) return;

        AppState.currentGroup = group;
        AppState.currentChatFriend = null;

        // Update UI
        document.getElementById('chat-header-name').textContent = group.name;
        document.getElementById('chat-header-status').textContent = `${group.members.length} members`;

        // Load group messages
        try {
            const { messages } = await API.getGroupMessages(groupId);
            AppState.groupMessages.set(groupId, messages || []);
            this.renderGroupMessages(groupId);
        } catch (error) {
            console.error('Error loading group messages:', error);
        }

        // Show chat area
        document.getElementById('chat-area').style.display = 'flex';
        document.getElementById('friends-list').style.display = 'none';
    },

    renderGroupMessages(groupId) {
        const messagesContainer = document.getElementById('messages-container');
        const messages = AppState.groupMessages.get(groupId) || [];

        messagesContainer.innerHTML = '';

        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';

            const isOwn = msg.sender_id === AppState.currentUser.id;
            if (isOwn) {
                messageDiv.classList.add('own-message');
            }

            const time = new Date(msg.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            messageDiv.innerHTML = `
                <img src="${msg.sender_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" alt="Avatar" class="message-avatar">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">${this.escapeHtml(msg.sender_username)}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(msg.message)}</div>
                </div>
            `;

            messagesContainer.appendChild(messageDiv);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    async loadGroups() {
        try {
            const { groups } = await API.getGroups();
            AppState.groups = groups || [];
            this.renderGroups();
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    },

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
