const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

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
            console.log(`${socket.user.username} joined conversation ${conversationId}`);
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

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.username}`);
        });
    });
};

module.exports = socketHandler;