const express = require('express');
const upload = require('../middleware/uploadMiddleware');

const {
    getOrCreateConversation,
    getUserConversations,
    getMessages,
    sendMessage,
    sendVoiceMessage
} = require('../controllers/chatController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/conversations')
    .get(protect, getUserConversations)
    .post(protect, getOrCreateConversation);

router.post('/messages/voice/:conversationId', protect, upload.single('voice'), sendVoiceMessage);

router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/messages', protect, sendMessage);

module.exports = router;