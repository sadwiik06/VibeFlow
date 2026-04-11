const express = require('express');
const { addComment, deleteComment, getPostComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/:postId', protect, addComment);
router.delete('/:commentId', protect, deleteComment);
router.get('/post/:postId', getPostComments);

module.exports = router;