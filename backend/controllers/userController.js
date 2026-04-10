const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

const getUserProfile = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username })
            .select('-password -email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get followers and following counts/data
        const follows = await Follow.find({
            $or: [{ follower: user._id }, { following: user._id }]
        }).populate('follower following', 'username profilePicture');

        const followers = follows.filter(f => f.following._id.toString() === user._id.toString()).map(f => f.follower);
        const following = follows.filter(f => f.follower._id.toString() === user._id.toString()).map(f => f.following);

        let isFollowing = false;
        if (req.user) {
            const follow = await Follow.findOne({
                follower: req.user._id,
                following: user._id,
            });
            isFollowing = !!follow;
        }

        const postsCount = await Post.countDocuments({ user: user._id });
        const userData = user.toObject();
        userData.isFollowing = isFollowing;
        userData.postsCount = postsCount;
        userData.followers = followers;
        userData.following = following;

        // Privacy check
        if (user.isPrivate && !isFollowing && req.user?._id.toString() !== user._id.toString()) {
            userData.fullName = undefined;
            userData.bio = undefined;
            userData.website = undefined;
            userData.postsCount = undefined;
            userData.followers = [];
            userData.following = [];
        }

        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { fullName, bio, website, isPrivate } = req.body;
        user.fullName = fullName !== undefined ? fullName : user.fullName;
        user.bio = bio !== undefined ? bio : user.bio;
        user.website = website !== undefined ? website : user.website;
        
        if (isPrivate !== undefined) {
            user.isPrivate = isPrivate === 'true' || isPrivate === true;
        }

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'SocialMedia/profiles' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            user.profilePicture = result.secure_url;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            profilePicture: updatedUser.profilePicture,
            bio: updatedUser.bio,
            isPrivate: updatedUser.isPrivate,
            website: updatedUser.website
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingFollow = await Follow.findOne({
            follower: currentUserId,
            following: targetUserId,
        });

        if (existingFollow) {
            await existingFollow.deleteOne();
            res.json({ message: 'Unfollowed', isFollowing: false });
        } else {
            await Follow.create({ follower: currentUserId, following: targetUserId });
            res.json({ message: 'Followed', isFollowing: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateProfile, followUser };
