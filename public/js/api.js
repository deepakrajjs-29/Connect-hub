// API Helper Functions
const API = {
    // Authentication
    async register(username, email, password, avatar) {
        const response = await fetch(`${CONFIG.API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, avatar })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        
        return data;
    },

    async login(email, password) {
        const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        return data;
    },

    async verifyToken(token) {
        const response = await fetch(`${CONFIG.API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Token verification failed');
        }
        
        return data;
    },

    // Users
    async searchUsers(query) {
        const response = await fetch(`${CONFIG.API_URL}/users/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${AppState.token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Search failed');
        }
        
        return data;
    },

    async sendFriendRequest(targetUserId) {
        const response = await fetch(`${CONFIG.API_URL}/users/friend-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AppState.token}`
            },
            body: JSON.stringify({ targetUserId })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send friend request');
        }
        
        return data;
    },

    async acceptFriendRequest(fromUserId) {
        const response = await fetch(`${CONFIG.API_URL}/users/friend-request/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AppState.token}`
            },
            body: JSON.stringify({ fromUserId })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to accept friend request');
        }
        
        return data;
    },

    async rejectFriendRequest(fromUserId) {
        const response = await fetch(`${CONFIG.API_URL}/users/friend-request/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AppState.token}`
            },
            body: JSON.stringify({ fromUserId })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to reject friend request');
        }
        
        return data;
    },

    async getFriends() {
        const response = await fetch(`${CONFIG.API_URL}/users/friends`, {
            headers: {
                'Authorization': `Bearer ${AppState.token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get friends');
        }
        
        return data;
    },

    async getFriendRequests() {
        const response = await fetch(`${CONFIG.API_URL}/users/friend-requests`, {
            headers: {
                'Authorization': `Bearer ${AppState.token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get friend requests');
        }
        
        return data;
    }
};
