const jwt = require('jsonwebtoken');
const { users } = require('../routes/auth');
const db = require('../database/db');

// Store active socket connections
const activeConnections = new Map(); // userId -> socketId
const rooms = new Map(); // roomId -> Set of userIds

function setupSocketHandlers(io) {
    // Socket.IO authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.username} (${socket.userId})`);

        // Store active connection
        activeConnections.set(socket.userId, socket.id);

        // Update user status to online
        const user = users.get(socket.userId);
        if (user) {
            user.status = 'online';
            
            // Notify friends that user is online
            user.friends.forEach(friendId => {
                const friendSocketId = activeConnections.get(friendId);
                if (friendSocketId) {
                    io.to(friendSocketId).emit('friend-status-change', {
                        userId: socket.userId,
                        username: socket.username,
                        status: 'online'
                    });
                }
            });
        }

        // Send current user info
        socket.emit('connected', {
            userId: socket.userId,
            username: socket.username
        });

        // Handle direct messages
        socket.on('send-message', (data) => {
            const { recipientId, message, timestamp, type } = data;
            const recipientSocketId = activeConnections.get(recipientId);

            const messageType = type || 'text'; // 'text' or 'voice'

            const messageData = {
                from: socket.userId,
                fromUsername: socket.username,
                message,
                type: messageType,
                timestamp: timestamp || new Date().toISOString()
            };

            // Save message to database for permanent storage
            try {
                db.saveMessage(socket.userId, recipientId, message, messageData.timestamp, messageType);
            } catch (error) {
                console.error('Error saving message to database:', error);
            }

            // Send to recipient if online
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('receive-message', messageData);
            }

            // Send confirmation back to sender
            socket.emit('message-sent', {
                ...messageData,
                recipientId,
                delivered: !!recipientSocketId
            });
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            const { recipientId, isTyping } = data;
            const recipientSocketId = activeConnections.get(recipientId);

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user-typing', {
                    userId: socket.userId,
                    username: socket.username,
                    isTyping
                });
            }
        });

        // WebRTC Signaling for Video Calls
        
        // Initiate call
        socket.on('call-user', (data) => {
            const { targetUserId, offer, callType } = data;
            const targetSocketId = activeConnections.get(targetUserId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('incoming-call', {
                    from: socket.userId,
                    fromUsername: socket.username,
                    offer,
                    callType // 'video' or 'voice'
                });
            } else {
                socket.emit('call-failed', {
                    error: 'User is offline'
                });
            }
        });

        // Answer call
        socket.on('answer-call', (data) => {
            const { targetUserId, answer } = data;
            const targetSocketId = activeConnections.get(targetUserId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('call-answered', {
                    from: socket.userId,
                    answer
                });
            }
        });

        // Reject call
        socket.on('reject-call', (data) => {
            const { targetUserId } = data;
            const targetSocketId = activeConnections.get(targetUserId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('call-rejected', {
                    from: socket.userId
                });
            }
        });

        // End call
        socket.on('end-call', (data) => {
            const { targetUserId } = data;
            const targetSocketId = activeConnections.get(targetUserId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('call-ended', {
                    from: socket.userId
                });
            }
        });

        // ICE candidate exchange
        socket.on('ice-candidate', (data) => {
            const { targetUserId, candidate } = data;
            const targetSocketId = activeConnections.get(targetUserId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('ice-candidate', {
                    from: socket.userId,
                    candidate
                });
            }
        });

        // Group call/room functionality
        socket.on('join-room', (data) => {
            const { roomId } = data;
            
            socket.join(roomId);
            
            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Set());
            }
            rooms.get(roomId).add(socket.userId);

            // Notify others in the room
            socket.to(roomId).emit('user-joined-room', {
                userId: socket.userId,
                username: socket.username,
                roomId
            });

            // Send list of current participants to the new user
            const participants = Array.from(rooms.get(roomId))
                .filter(id => id !== socket.userId)
                .map(id => {
                    const user = users.get(id);
                    return user ? {
                        userId: user.id,
                        username: user.username,
                        avatar: user.avatar
                    } : null;
                })
                .filter(p => p !== null);

            socket.emit('room-participants', {
                roomId,
                participants
            });
        });

        socket.on('leave-room', (data) => {
            const { roomId } = data;
            
            socket.leave(roomId);
            
            if (rooms.has(roomId)) {
                rooms.get(roomId).delete(socket.userId);
                
                if (rooms.get(roomId).size === 0) {
                    rooms.delete(roomId);
                }
            }

            // Notify others in the room
            socket.to(roomId).emit('user-left-room', {
                userId: socket.userId,
                username: socket.username,
                roomId
            });
        });

        // WebRTC signaling for group calls
        socket.on('room-offer', (data) => {
            const { roomId, targetUserId, offer } = data;
            const targetSocketId = activeConnections.get(targetUserId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('room-offer', {
                    from: socket.userId,
                    fromUsername: socket.username,
                    roomId,
                    offer
                });
            }
        });

        socket.on('room-answer', (data) => {
            const { roomId, targetUserId, answer } = data;
            const targetSocketId = activeConnections.get(targetUserId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('room-answer', {
                    from: socket.userId,
                    roomId,
                    answer
                });
            }
        });

        socket.on('room-ice-candidate', (data) => {
            const { roomId, targetUserId, candidate } = data;
            const targetSocketId = activeConnections.get(targetUserId);

            if (targetSocketId) {
                io.to(targetSocketId).emit('room-ice-candidate', {
                    from: socket.userId,
                    roomId,
                    candidate
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.username} (${socket.userId})`);

            // Remove from active connections
            activeConnections.delete(socket.userId);

            // Update user status to offline
            const user = users.get(socket.userId);
            if (user) {
                user.status = 'offline';
                
                // Notify friends that user is offline
                user.friends.forEach(friendId => {
                    const friendSocketId = activeConnections.get(friendId);
                    if (friendSocketId) {
                        io.to(friendSocketId).emit('friend-status-change', {
                            userId: socket.userId,
                            username: socket.username,
                            status: 'offline'
                        });
                    }
                });
            }

            // Remove from all rooms
            rooms.forEach((participants, roomId) => {
                if (participants.has(socket.userId)) {
                    participants.delete(socket.userId);
                    
                    // Notify others in the room
                    socket.to(roomId).emit('user-left-room', {
                        userId: socket.userId,
                        username: socket.username,
                        roomId
                    });

                    if (participants.size === 0) {
                        rooms.delete(roomId);
                    }
                }
            });
        });
    });
}

module.exports = { setupSocketHandlers };
