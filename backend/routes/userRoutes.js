const express = require('express');
const {
    getUserProfile,
    updateProfile,
    followUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/:username', protect, getUserProfile);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.post('/:id/follow', protect, followUser);

module.exports = router;
