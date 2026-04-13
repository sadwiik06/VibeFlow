const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

const getOrCreateConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUserId = req.user._id;

        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, userId], $size: 2 },
        }).populate('participants', 'username fullName profilePicture');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [currentUserId, userId],
            });
            await conversation.populate('participants', 'username fullName profilePicture');
        }
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendVoiceMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const senderId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: 'Audio file is required' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.participants.includes(senderId)) {
            return res.status(403).json({ message: 'Not a participant' });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'SocialMedia/voice-messages', resource_type: 'video' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text: 'Voice Message',
            mediaType: 'voice',
            mediaUrl: result.secure_url,
            duration: req.body.duration || 0,
        });

        conversation.lastMessage = message._id;
        await conversation.save();
        await message.populate('sender', 'username fullName profilePicture');

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
        })
            .populate('participants', 'username fullName profilePicture')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const messages = await Message.find({ conversation: req.params.conversationId })
            .populate('sender', 'username fullName profilePicture')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = req.user._id;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (!conversation.participants.includes(senderId)) {
            return res.status(403).json({ message: 'Not a participant' });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text,
        });
        conversation.lastMessage = message._id;
        await conversation.save();
        await message.populate('sender', 'username fullName profilePicture');
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOrCreateConversation,
    getUserConversations,
    getMessages,
    sendMessage,
    sendVoiceMessage
};