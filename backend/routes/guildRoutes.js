const express = require('express');
const {
    createGuild, getPublicGuilds, getMyGuilds, joinGuild, leaveGuild, handleJoinRequest,
    getGuildMessages, getGuildById, joinGuildByToken, updateGuild, deleteGuild, transferOwnership
} = require('../controllers/guildController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/')
.get(protect, getPublicGuilds)
.post(protect, upload.single('coverImage'), createGuild);

router.get('/my', protect, getMyGuilds);

router.get('/join/:inviteToken', protect, joinGuildByToken);

router.route('/:guildId')
.get(protect, getGuildById)
.put(protect, upload.single('coverImage'), updateGuild)
.delete(protect, deleteGuild);

router.put('/:guildId/transfer', protect, transferOwnership);

router.post('/:guildId/join', protect, joinGuild);
router.post('/:guildId/leave', protect, leaveGuild);
router.put('/:guildId/requests/:userId', protect, handleJoinRequest);
router.get('/:guildId/messages', protect, getGuildMessages);

module.exports = router;
