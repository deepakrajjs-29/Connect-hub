const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('./auth');

// Get messages between current user and another user
router.get('/messages/:userId', authenticateToken, (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const otherUserId = req.params.userId;

        const messages = db.getMessages(currentUserId, otherUserId);

        res.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Create a new group
router.post('/groups', authenticateToken, (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const createdBy = req.user.userId;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        // Generate group ID
        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create group
        db.createGroup(groupId, name.trim(), createdBy);

        // Add additional members if provided
        if (memberIds && Array.isArray(memberIds)) {
            memberIds.forEach(memberId => {
                if (memberId !== createdBy) {
                    try {
                        db.addGroupMember(groupId, memberId);
                    } catch (err) {
                        console.error(`Failed to add member ${memberId}:`, err);
                    }
                }
            });
        }

        const group = db.getGroup(groupId);
        const members = db.getGroupMembers(groupId);

        res.json({ 
            group,
            members: members.map(m => m.user_id)
        });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// Get user's groups
router.get('/groups', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const groups = db.getUserGroups(userId);

        // Get members for each group
        const groupsWithMembers = groups.map(group => {
            const members = db.getGroupMembers(group.id);
            return {
                ...group,
                members: members.map(m => m.user_id)
            };
        });

        res.json({ groups: groupsWithMembers });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

// Get group messages
router.get('/groups/:groupId/messages', authenticateToken, (req, res) => {
    try {
        const groupId = req.params.groupId;
        const messages = db.getGroupMessages(groupId);

        res.json({ messages });
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).json({ error: 'Failed to fetch group messages' });
    }
});

// Add member to group
router.post('/groups/:groupId/members', authenticateToken, (req, res) => {
    try {
        const groupId = req.params.groupId;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        db.addGroupMember(groupId, userId);
        const members = db.getGroupMembers(groupId);

        res.json({ 
            members: members.map(m => m.user_id)
        });
    } catch (error) {
        console.error('Error adding group member:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

module.exports = router;
