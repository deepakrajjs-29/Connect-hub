const express = require('express');
const jwt = require('jsonwebtoken');
const { users } = require('./auth');
const router = express.Router();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Get all users (for search)
router.get('/', authenticateToken, (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const allUsers = Array.from(users.values())
            .filter(u => u.id !== currentUserId)
            .map(({ password, ...user }) => user);

        res.json({ users: allUsers });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Search users
router.get('/search', authenticateToken, (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user.userId;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter required' });
        }

        const results = Array.from(users.values())
            .filter(u => 
                u.id !== currentUserId &&
                (u.username.toLowerCase().includes(query.toLowerCase()) ||
                 u.email.toLowerCase().includes(query.toLowerCase()))
            )
            .map(({ password, ...user }) => user);

        res.json({ users: results });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send friend request
router.post('/friend-request', authenticateToken, (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.userId;

        const currentUser = users.get(currentUserId);
        const targetUser = users.get(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already friends
        if (currentUser.friends.includes(targetUserId)) {
            return res.status(400).json({ error: 'Already friends' });
        }

        // Check if request already sent
        if (targetUser.friendRequests.some(req => req.from === currentUserId)) {
            return res.status(400).json({ error: 'Friend request already sent' });
        }

        // Add friend request
        targetUser.friendRequests.push({
            from: currentUserId,
            username: currentUser.username,
            avatar: currentUser.avatar,
            timestamp: new Date()
        });

        res.json({ message: 'Friend request sent' });
    } catch (error) {
        console.error('Friend request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Accept friend request
router.post('/friend-request/accept', authenticateToken, (req, res) => {
    try {
        const { fromUserId } = req.body;
        const currentUserId = req.user.userId;

        const currentUser = users.get(currentUserId);
        const fromUser = users.get(fromUserId);

        if (!fromUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove friend request
        currentUser.friendRequests = currentUser.friendRequests.filter(
            req => req.from !== fromUserId
        );

        // Add to friends list
        if (!currentUser.friends.includes(fromUserId)) {
            currentUser.friends.push(fromUserId);
        }
        if (!fromUser.friends.includes(currentUserId)) {
            fromUser.friends.push(currentUserId);
        }

        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reject friend request
router.post('/friend-request/reject', authenticateToken, (req, res) => {
    try {
        const { fromUserId } = req.body;
        const currentUserId = req.user.userId;

        const currentUser = users.get(currentUserId);

        // Remove friend request
        currentUser.friendRequests = currentUser.friendRequests.filter(
            req => req.from !== fromUserId
        );

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error('Reject friend request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get friends list
router.get('/friends', authenticateToken, (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const currentUser = users.get(currentUserId);

        const friends = currentUser.friends
            .map(friendId => users.get(friendId))
            .filter(friend => friend) // Remove any undefined entries
            .map(({ password, ...friend }) => friend);

        res.json({ friends });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get friend requests
router.get('/friend-requests', authenticateToken, (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const currentUser = users.get(currentUserId);

        res.json({ friendRequests: currentUser.friendRequests });
    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
