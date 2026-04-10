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

        // Get list of users the current user follows (accepted only)
        const acceptedFollows = await Follow.find({
            follower: req.user._id,
            status: 'accepted',
        }).select('following');
        const followingIds = acceptedFollows.map(f => f.following);

        // Get all private user IDs
        const privateUsers = await User.find({ isPrivate: true }).select('_id');
        const privateUserIds = privateUsers.map(u => u._id);

        // Build query: show posts from
        // 1. The current user themselves
        // 2. Public accounts (anyone not in privateUserIds)
        // 3. Private accounts that the user follows (accepted)
        const allowedUserIds = [req.user._id, ...followingIds];

        const query = {
            $or: [
                { user: { $in: allowedUserIds } },
                { user: { $nin: privateUserIds } }
            ]
        };

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePicture');

        const total = await Post.countDocuments(query);

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

        // Fetch the target user to check privacy
        const targetUser = await User.findById(userId).select('isPrivate');
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isOwner = req.user._id.toString() === userId.toString();

        // If private account and not the owner, check if requester is an ACCEPTED follower
        if (targetUser.isPrivate && !isOwner) {
            const isFollower = await Follow.findOne({
                follower: req.user._id,
                following: userId,
                status: 'accepted',
            });
            if (!isFollower) {
                // Private account — non-followers cannot see posts
                return res.json({ posts: [], isPrivate: true });
            }
        }

        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');

        res.json({ posts, isPrivate: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPost, getFeed, getUserPosts };
