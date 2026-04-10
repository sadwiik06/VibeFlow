const express = require('express');

const {
    createPost,
    getFeed,getUserPosts
} = require('../controllers/postController');

const {protect} = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router  = express.Router();

router.route('/') .post(protect, upload.single('media'),createPost);

router.get('/feed',protect,getFeed);
router.get('/user/:userId',protect, getUserPosts);
module.exports = router;

