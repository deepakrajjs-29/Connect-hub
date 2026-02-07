// ===================================
// CHAT MODULE
// ===================================

class ChatManager {
    constructor() {
        this.currentMessages = [];
        this.emojiPickerOpen = false;
    }

    initialize() {
        this.setupUserProfile();
        this.renderServers();
        this.renderChannels(AppState.currentServer);
        this.renderMessages(AppState.currentChannel);
        this.renderMembers();
        this.setupEmojis();
        this.attachEventListeners();
    }

    setupUserProfile() {
        if (!AppState.currentUser) return;

        const usernameEl = document.getElementById('current-username');
        const avatarEl = document.getElementById('user-avatar-img');

        if (usernameEl) usernameEl.textContent = AppState.currentUser.username;
        if (avatarEl) avatarEl.src = AppState.currentUser.avatar;
    }

    renderServers() {
        const serversList = document.getElementById('servers-list');
        if (!serversList) return;

        serversList.innerHTML = '';

        MOCK_SERVERS.forEach(server => {
            const serverIcon = document.createElement('div');
            serverIcon.className = 'server-icon';
            serverIcon.dataset.serverId = server.id;
            serverIcon.title = server.name;
            serverIcon.style.background = server.color;
            serverIcon.textContent = server.icon;

            serverIcon.addEventListener('click', () => {
                this.switchServer(server.id);
            });

            serversList.appendChild(serverIcon);
        });
    }

    switchServer(serverId) {
        AppState.currentServer = serverId;

        // Update active state
        document.querySelectorAll('.server-icon').forEach(icon => {
            icon.classList.remove('active');
        });
        document.querySelector(`[data-server-id="${serverId}"]`)?.classList.add('active');

        // Update server name
        const serverName = serverId === 'home' ? 'Home' : 
            MOCK_SERVERS.find(s => s.id === serverId)?.name || 'Server';
        document.getElementById('current-server-name').textContent = serverName;

        // Render channels for this server
        this.renderChannels(serverId);
    }

    renderChannels(serverId) {
        const textChannelsList = document.getElementById('text-channels-list');
        const voiceChannelsList = document.getElementById('voice-channels-list');

        if (!textChannelsList || !voiceChannelsList) return;

        const channels = MOCK_CHANNELS[serverId] || MOCK_CHANNELS['home'];

        // Render text channels
        textChannelsList.innerHTML = '';
        channels.text.forEach(channel => {
            const channelItem = this.createChannelElement(channel);
            textChannelsList.appendChild(channelItem);
        });

        // Render voice channels
        voiceChannelsList.innerHTML = '';
        channels.voice.forEach(channel => {
            const channelItem = this.createChannelElement(channel);
            voiceChannelsList.appendChild(channelItem);
        });

        // Set first text channel as active
        if (channels.text.length > 0) {
            this.switchChannel(channels.text[0].id, channels.text[0].name);
        }
    }

    createChannelElement(channel) {
        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item';
        channelItem.dataset.channelId = channel.id;

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('width', '20');
        icon.setAttribute('height', '20');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('stroke-width', '2');

        if (channel.type === 'text') {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
            icon.appendChild(path);
        } else {
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z');
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M19 10v2a7 7 0 0 1-14 0v-2');
            icon.appendChild(path1);
            icon.appendChild(path2);
        }

        const channelName = document.createElement('span');
        channelName.className = 'channel-name';
        channelName.textContent = channel.name;

        channelItem.appendChild(icon);
        channelItem.appendChild(channelName);

        channelItem.addEventListener('click', () => {
            if (channel.type === 'voice') {
                // Start voice call for voice channels
                if (window.voiceCallManager) {
                    window.voiceCallManager.startVoiceCall(channel.name);
                }
            } else {
                // Switch to text channel
                this.switchChannel(channel.id, channel.name);
            }
        });

        return channelItem;
    }

    switchChannel(channelId, channelName) {
        AppState.currentChannel = channelId;

        // Update active state
        document.querySelectorAll('.channel-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-channel-id="${channelId}"]`)?.classList.add('active');

        // Update channel name in header
        document.getElementById('current-channel-name').textContent = channelName;

        // Update input placeholder
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.setAttribute('data-placeholder', `Message #${channelName}`);
        }

        // Render messages for this channel
        this.renderMessages(channelId);
    }

    renderMessages(channelId) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messages = MOCK_MESSAGES[channelId] || [];
        this.currentMessages = messages;

        messagesContainer.innerHTML = '';

        if (messages.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.style.cssText = 'text-align: center; padding: 40px; color: var(--text-muted);';
            emptyState.innerHTML = `
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 16px; opacity: 0.3;">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>No messages yet. Start the conversation!</p>
            `;
            messagesContainer.appendChild(emptyState);
            return;
        }

        messages.forEach(message => {
            const messageEl = this.createMessageElement(message);
            messagesContainer.appendChild(messageEl);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        const avatar = document.createElement('img');
        avatar.className = 'message-avatar';
        avatar.src = message.avatar;
        avatar.alt = message.author;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';

        const author = document.createElement('span');
        author.className = 'message-author';
        author.textContent = message.author;

        const timestamp = document.createElement('span');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = formatTimestamp(message.timestamp);

        messageHeader.appendChild(author);
        messageHeader.appendChild(timestamp);

        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = message.content;

        messageContent.appendChild(messageHeader);
        messageContent.appendChild(messageText);

        // Add attachments if any
        if (message.attachments && message.attachments.length > 0) {
            message.attachments.forEach(attachment => {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                
                const img = document.createElement('img');
                img.src = attachment.url;
                img.alt = attachment.name;
                
                attachmentDiv.appendChild(img);
                messageContent.appendChild(attachmentDiv);
            });
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        return messageDiv;
    }

    renderMembers() {
        const membersList = document.getElementById('members-list');
        if (!membersList) return;

        membersList.innerHTML = '';

        // Group members by status
        const onlineMembers = MOCK_MEMBERS.filter(m => m.status === 'online');
        const offlineMembers = MOCK_MEMBERS.filter(m => m.status === 'offline');
        const otherMembers = MOCK_MEMBERS.filter(m => m.status !== 'online' && m.status !== 'offline');

        // Render online members
        if (onlineMembers.length > 0) {
            const onlineCategory = this.createMemberCategory('Online', onlineMembers);
            membersList.appendChild(onlineCategory);
        }

        // Render other status members
        if (otherMembers.length > 0) {
            const otherCategory = this.createMemberCategory('Away', otherMembers);
            membersList.appendChild(otherCategory);
        }

        // Render offline members
        if (offlineMembers.length > 0) {
            const offlineCategory = this.createMemberCategory('Offline', offlineMembers);
            membersList.appendChild(offlineCategory);
        }
    }

    createMemberCategory(title, members) {
        const category = document.createElement('div');
        category.className = 'member-category';

        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'member-category-title';
        categoryTitle.textContent = `${title} — ${members.length}`;

        category.appendChild(categoryTitle);

        members.forEach(member => {
            const memberItem = this.createMemberElement(member);
            category.appendChild(memberItem);
        });

        return category;
    }

    createMemberElement(member) {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';

        const memberAvatar = document.createElement('div');
        memberAvatar.className = 'member-avatar';

        const avatar = document.createElement('img');
        avatar.src = member.avatar;
        avatar.alt = member.name;

        const statusIndicator = document.createElement('span');
        statusIndicator.className = `status-indicator ${member.status}`;

        memberAvatar.appendChild(avatar);
        memberAvatar.appendChild(statusIndicator);

        const memberName = document.createElement('span');
        memberName.className = 'member-name';
        memberName.textContent = member.name;

        memberItem.appendChild(memberAvatar);
        memberItem.appendChild(memberName);

        if (member.role) {
            const memberRole = document.createElement('span');
            memberRole.className = 'member-role';
            memberRole.textContent = member.role;
            memberItem.appendChild(memberRole);
        }

        return memberItem;
    }

    setupEmojis() {
        const emojiGrid = document.querySelector('.emoji-grid');
        if (!emojiGrid) return;

        emojiGrid.innerHTML = '';

        EMOJIS.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            
            emojiItem.addEventListener('click', () => {
                this.insertEmoji(emoji);
            });

            emojiGrid.appendChild(emojiItem);
        });
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;

        messageInput.textContent += emoji;
        messageInput.focus();

        // Close emoji picker
        this.toggleEmojiPicker();
    }

    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emoji-picker');
        if (!emojiPicker) return;

        this.emojiPickerOpen = !this.emojiPickerOpen;
        
        if (this.emojiPickerOpen) {
            emojiPicker.classList.add('active');
        } else {
            emojiPicker.classList.remove('active');
        }
    }

    attachEventListeners() {
        // Message input - send on Enter
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Emoji button
        const emojiBtn = document.getElementById('emoji-btn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                this.toggleEmojiPicker();
            });
        }

        // File attachment
        const attachFileBtn = document.getElementById('attach-file-btn');
        const fileInput = document.getElementById('file-input');
        
        if (attachFileBtn && fileInput) {
            attachFileBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }

        // Home server click
        const homeServer = document.querySelector('.home-server');
        if (homeServer) {
            homeServer.addEventListener('click', () => {
                this.switchServer('home');
            });
        }

        // Add server button
        const addServerBtn = document.getElementById('add-server');
        if (addServerBtn) {
            addServerBtn.addEventListener('click', () => {
                this.showNotification('Add server feature coming soon! 🚀');
            });
        }

        // Start video call button
        const startVideoCallBtn = document.getElementById('start-video-call');
        if (startVideoCallBtn) {
            startVideoCallBtn.addEventListener('click', () => {
                if (window.meetingManager) {
                    window.meetingManager.startMeeting();
                }
            });
        }

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emoji-picker');
            const emojiBtn = document.getElementById('emoji-btn');
            
            if (this.emojiPickerOpen && 
                !emojiPicker.contains(e.target) && 
                !emojiBtn.contains(e.target)) {
                this.toggleEmojiPicker();
            }
        });
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;

        const content = messageInput.textContent.trim();
        if (!content) return;

        const newMessage = {
            id: generateId(),
            author: AppState.currentUser.username,
            avatar: AppState.currentUser.avatar,
            content: content,
            timestamp: new Date().toISOString(),
            attachments: []
        };

        // Add to current messages
        if (!MOCK_MESSAGES[AppState.currentChannel]) {
            MOCK_MESSAGES[AppState.currentChannel] = [];
        }
        MOCK_MESSAGES[AppState.currentChannel].push(newMessage);

        // Re-render messages
        this.renderMessages(AppState.currentChannel);

        // Clear input
        messageInput.textContent = '';
    }

    handleFileUpload(files) {
        if (files.length === 0) return;

        const file = files[0];
        
        // Create a preview (mock)
        this.showNotification(`File "${file.name}" attached! (Preview only - no backend) 📎`);
        
        // In a real app, you would upload the file here
        // For now, we'll just show a notification
    }

    showNotification(message) {
        const toast = document.getElementById('notification-toast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toastMessage.textContent = message;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
}

// Export for use in app.js
window.chatManager = new ChatManager();
