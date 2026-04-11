const Comment = require('../models/Comment');
const Post = require('../models/Post');

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.postId;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const comment = await Comment.create({
            user: userId,
            post: postId,
            text,
        });

        await comment.populate('user', 'username profilePicture');
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        const post = await Post.findById(comment.post);
        const isCommentOwner = comment.user.toString() === req.user._id.toString();
        const isPostOwner = post.user.toString() === req.user._id.toString();
        if (!isCommentOwner && !isPostOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }
        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPostComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addComment, deleteComment, getPostComments };
