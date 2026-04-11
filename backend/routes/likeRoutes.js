const express = require('express');
const { toggleLike, getPostLikes } = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/:postId', protect, toggleLike);
router.get('/:postId', getPostLikes);

module.exports = router;
