const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, default: '' },
        mediaType: { type: String, enum: ['text', 'voice'], default: 'text' },
        mediaUrl: { type: String, default: '' },
        duration: { type: Number },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);