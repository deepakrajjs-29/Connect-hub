const fs = require('fs');
const path = require('path');

// Data directory
const dataDir = path.join(__dirname, '../data');
const messagesFile = path.join(dataDir, 'messages.json');
const groupsFile = path.join(dataDir, 'groups.json');
const groupMessagesFile = path.join(dataDir, 'group_messages.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files
function initFile(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

initFile(messagesFile);
initFile(groupsFile);
initFile(groupMessagesFile);

// Helper functions
function readJSON(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
    }
}

// Database functions
const Database = {
    // Save a direct message
    saveMessage(fromUserId, toUserId, message, timestamp, messageType = 'text') {
        const messages = readJSON(messagesFile);
        messages.push({
            id: Date.now() + Math.random(),
            from_user_id: fromUserId,
            to_user_id: toUserId,
            message: message,
            message_type: messageType, // 'text' or 'voice'
            timestamp: timestamp,
            created_at: new Date().toISOString()
        });
        writeJSON(messagesFile, messages);
    },

    // Get messages between two users
    getMessages(userId1, userId2) {
        const messages = readJSON(messagesFile);
        return messages.filter(msg =>
            (msg.from_user_id === userId1 && msg.to_user_id === userId2) ||
            (msg.from_user_id === userId2 && msg.to_user_id === userId1)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    // Create a new group
    createGroup(groupId, name, createdBy) {
        const groups = readJSON(groupsFile);
        const newGroup = {
            id: groupId,
            name: name,
            created_by: createdBy,
            members: [createdBy],
            created_at: new Date().toISOString()
        };
        groups.push(newGroup);
        writeJSON(groupsFile, groups);
        return newGroup;
    },

    // Get group by ID
    getGroup(groupId) {
        const groups = readJSON(groupsFile);
        return groups.find(g => g.id === groupId);
    },

    // Get all groups for a user
    getUserGroups(userId) {
        const groups = readJSON(groupsFile);
        return groups.filter(g => g.members.includes(userId));
    },

    // Add member to group
    addGroupMember(groupId, userId) {
        const groups = readJSON(groupsFile);
        const group = groups.find(g => g.id === groupId);
        if (group && !group.members.includes(userId)) {
            group.members.push(userId);
            writeJSON(groupsFile, groups);
        }
    },

    // Get all members of a group
    getGroupMembers(groupId) {
        const group = this.getGroup(groupId);
        return group ? group.members.map(id => ({ user_id: id })) : [];
    },

    // Save group message
    saveGroupMessage(groupId, fromUserId, message, timestamp) {
        const messages = readJSON(groupMessagesFile);
        messages.push({
            id: Date.now() + Math.random(),
            group_id: groupId,
            from_user_id: fromUserId,
            message: message,
            timestamp: timestamp,
            created_at: new Date().toISOString()
        });
        writeJSON(groupMessagesFile, messages);
    },

    // Get group messages
    getGroupMessages(groupId) {
        const messages = readJSON(groupMessagesFile);
        return messages
            .filter(msg => msg.group_id === groupId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
};

module.exports = Database;
