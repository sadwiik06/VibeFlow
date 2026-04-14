const express = require('express');

const {
    createPost,
    getFeed,
    getUserPosts,
    getReels,
    deletePost,
    getPostById
} = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/').post(protect, upload.single('media'), createPost);
router.get('/feed', protect, getFeed);
router.get('/reels', protect, getReels);
router.get('/user/:userId', protect, getUserPosts);
router.get('/:postId', protect, getPostById);
router.delete('/:postId', protect, deletePost);

module.exports = router;
