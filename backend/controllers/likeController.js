const Like = require('../models/Like');
const Post = require('../models/Post');

const toggleLike = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const existingLike = await Like.findOne({ user: userId, post: postId });
        if (existingLike) {
            await existingLike.deleteOne();
            res.json({ liked: false });
        } else {
            await Like.create({ user: userId, post: postId });
            res.json({ liked: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPostLikes = async (req, res) => {
    try {
        const likes = await Like.find({ post: req.params.postId }).populate('user', 'username profilePicture');
        res.json(likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { toggleLike, getPostLikes };