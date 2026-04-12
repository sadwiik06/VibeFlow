const express = require('express');
const {
    getUserProfile,
    updateProfile,
    followUser,
    getFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    searchUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Static routes MUST come before dynamic param routes
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.get('/follow-requests', protect, getFollowRequests);
router.post('/follow-requests/:requestId/accept', protect, acceptFollowRequest);
router.post('/follow-requests/:requestId/reject', protect, rejectFollowRequest);
router.get('/search', protect, searchUsers);
// Dynamic param routes
router.get('/:username', protect, getUserProfile);
router.post('/:id/follow', protect, followUser);

module.exports = router;
