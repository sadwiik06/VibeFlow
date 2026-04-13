const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Guild = require('../models/Guild');
const GuildMessage = require('../models/GuildMessage');
const Follow = require('../models/Follow');

const watchSessions = new Map();

const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 12);
};

const checkMutualFollow = async (userA, userB) => {
    const follow1 = await Follow.findOne({ follower: userA, following: userB });
    const follow2 = await Follow.findOne({ follower: userB, following: userA });
    return !!(follow1 && follow2);
};

const socketHandler = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.username} (${socket.id})`);
        socket.join(socket.user._id.toString());

        socket.on('join conversation', (conversationId) => {
            socket.join(conversationId);
        });

        socket.on('leave conversation', (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on('send message', async (data, callback) => {
            try {
                const { conversationId, text } = data;
                const senderId = socket.user._id;

                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return callback({ error: 'Conversation not found' });
                }

                if (!conversation.participants.includes(senderId)) {
                    return callback({ error: 'Not a participant' });
                }

                const message = await Message.create({
                    conversation: conversationId,
                    sender: senderId,
                    text,
                });

                await message.populate('sender', 'username fullName profilePicture');
                conversation.lastMessage = message._id;
                await conversation.save();

                io.to(conversationId).emit('new message', message);
                
                const recipientId = conversation.participants.find(
                    (p) => p.toString() !== senderId.toString()
                );

                if (recipientId) {
                    io.to(recipientId.toString()).emit('message notification', {
                        conversationId,
                        message,
                        sender: socket.user,
                    });
                }

                callback({ success: true, message });
            } catch (error) {
                console.error('Send message error:', error);
                callback({ error: 'Failed to send message' });
            }
        });

        // Watch Together Logic
        socket.on('create watch session', (callback) => {
            const sessionId = generateSessionId();
            watchSessions.set(sessionId, {
                host: socket.user._id,
                guest: null,
                hostSocketId: socket.id,
                currentReelIndex: 0,
                isPlaying: true,
                timestamp: 0,
            });
            socket.join(`watch:${sessionId}`);
            callback({ sessionId });
        });

        socket.on('join watch session', async ({ sessionId }, callback) => {
            const session = watchSessions.get(sessionId);
            if (!session) return callback({ error: 'Session not found' });
            if (session.guest) return callback({ error: 'Session already has a guest' });

            const isMutual = await checkMutualFollow(session.host, socket.user._id);
            if (!isMutual) return callback({ error: 'You must follow each other to watch together' });

            session.guest = socket.user._id;
            session.guestSocketId = socket.id;
            socket.join(`watch:${sessionId}`);
            
            io.to(session.hostSocketId).emit('watch guest joined', { guest: socket.user });
            
            callback({
                success: true,
                currentReelIndex: session.currentReelIndex,
                isPlaying: session.isPlaying,
                timestamp: session.timestamp,
            });
        });

        socket.on('watch sync', ({ sessionId, action, payload }) => {
            const session = watchSessions.get(sessionId);
            if (!session) return;

            // Only host or guest should be able to sync
            if (socket.user._id.toString() !== session.host.toString() && 
                socket.user._id.toString() !== session.guest?.toString()) return;

            switch (action) {
                case 'next':
                case 'prev':
                    session.currentReelIndex = payload.index;
                    break;
                case 'play':
                    session.isPlaying = true;
                    session.timestamp = payload.timestamp;
                    break;
                case 'pause':
                    session.isPlaying = false;
                    session.timestamp = payload.timestamp;
                    break;
                case 'seek':
                    session.timestamp = payload.timestamp;
                    break;
            }

            const targetSocketId = socket.user._id.toString() === session.host.toString() 
                ? session.guestSocketId 
                : session.hostSocketId;

            if (targetSocketId) {
                io.to(targetSocketId).emit('watch sync', { action, payload });
            }
        });

        socket.on('leave watch session', ({ sessionId }) => {
            const session = watchSessions.get(sessionId);
            if (!session) return;

            if (socket.user._id.toString() === session.host.toString()) {
                if (session.guestSocketId) {
                    io.to(session.guestSocketId).emit('watch session ended');
                }
                watchSessions.delete(sessionId);
            } else if (session.guest && socket.user._id.toString() === session.guest.toString()) {
                session.guest = null;
                session.guestSocketId = null;
                io.to(session.hostSocketId).emit('watch guest left');
            }
            socket.leave(`watch:${sessionId}`);
        });

        socket.on('typing', ({ conversationId, isTyping }) => {
            socket.to(conversationId).emit('user typing', {
                userId: socket.user._id,
                username: socket.user.username,
                isTyping,
            });
        });

        socket.on('mark read', async ({ conversationId }) => {
            try {
                await Message.updateMany(
                    {
                        conversation: conversationId,
                        sender: { $ne: socket.user._id },
                        read: false,
                    },
                    { read: true }
                );
                io.to(conversationId).emit('messages read', {
                    conversationId,
                    userId: socket.user._id,
                });
            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        socket.on('join guild', (guildId) => {
            socket.join(`guild:${guildId}`);
        });

        socket.on('leave guild', (guildId) => {
            socket.leave(`guild:${guildId}`);
        });

        socket.on('send guild message', async (data, callback) => {
            try {
                const { guildId, text } = data;
                const senderId = socket.user._id;
                const guild = await Guild.findById(guildId);
                if (!guild) return callback({ error: 'Guild not found' });
                if (!guild.members.includes(senderId)) {
                    return callback({ error: 'Not a member' });
                }
                const message = await GuildMessage.create({
                    guild: guildId,
                    sender: senderId,
                    text,
                });
                await message.populate('sender', 'username profilePicture');
                io.to(`guild:${guildId}`).emit('new guild message', message);
                callback({ success: true, message });
            } catch (error) {
                callback({ error: error.message });
            }
        });

        socket.on('disconnect', () => {
            // Check if user was in a watch session
            for (let [sessionId, session] of watchSessions.entries()) {
                if (session.host.toString() === socket.user._id.toString()) {
                    if (session.guestSocketId) io.to(session.guestSocketId).emit('watch session ended');
                    watchSessions.delete(sessionId);
                } else if (session.guest?.toString() === socket.user._id.toString()) {
                    session.guest = null;
                    session.guestSocketId = null;
                    io.to(session.hostSocketId).emit('watch guest left');
                }
            }
            console.log(`User disconnected: ${socket.user.username}`);
        });
    });
};

module.exports = socketHandler;