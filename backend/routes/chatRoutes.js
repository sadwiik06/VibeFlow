const express = require('express');

const {
    getOrCreateConversation,
    getUserConversations,
    getMessages,
    sendMessage,
} = require('../controllers/chatController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/conversations')
    .get(protect, getUserConversations)
    .post(protect, getOrCreateConversation);

router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/messages', protect, sendMessage);

module.exports = router;