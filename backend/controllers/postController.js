const Post = require('../models/Post');
const User = require('../models/User');
const Follow = require('../models/Follow');
const cloudinary = require('../config/cloudinary');


const createPost = async (req, res) => {
    try {
        const { caption, location, type = 'post' } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Media file is required' });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'SocialMedia/posts',
                    resource_type: type === 'reel' ? 'video' : 'image',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        const mediaUrl = result.secure_url;
        const post = await Post.create({
            user: req.user._id,
            type,
            mediaUrl,
            caption,
            location
        });

        await post.populate('user', 'username profilePicture');
        res.status(201).json(post);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Show ALL posts from every user (public/explore feed)
        // so users can discover content without needing to follow anyone first
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePicture');

        const total = await Post.countDocuments();

        res.json({
            posts,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        console.error('[getFeed] error:', error);
        res.status(500).json({ message: error.message });
    }
};


const getUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPost, getFeed, getUserPosts };
