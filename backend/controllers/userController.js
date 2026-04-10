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

        const isOwner = req.user?._id.toString() === user._id.toString();

        // Check current user's follow relationship with this profile
        let followStatus = 'none'; // 'none', 'pending', 'accepted'
        if (req.user && !isOwner) {
            const follow = await Follow.findOne({
                follower: req.user._id,
                following: user._id,
            });
            if (follow) {
                followStatus = follow.status; // 'pending' or 'accepted'
            }
        }

        const isFollowing = followStatus === 'accepted';
        const canViewFullProfile = isOwner || !user.isPrivate || isFollowing;

        const postsCount = await Post.countDocuments({ user: user._id });
        const userData = user.toObject();
        userData.isFollowing = isFollowing;
        userData.followStatus = followStatus;
        userData.postsCount = postsCount;

        if (canViewFullProfile) {
            // Full access — show followers/following lists
            const follows = await Follow.find({
                $or: [
                    { follower: user._id, status: 'accepted' },
                    { following: user._id, status: 'accepted' }
                ]
            }).populate('follower following', 'username profilePicture');

            userData.followers = follows
                .filter(f => f.following._id.toString() === user._id.toString())
                .map(f => f.follower);
            userData.following = follows
                .filter(f => f.follower._id.toString() === user._id.toString())
                .map(f => f.following);
        } else {
            // Private account, not following — hide everything
            // Only show username, profile picture, and that it's private
            const followersCount = await Follow.countDocuments({ following: user._id, status: 'accepted' });
            const followingCount = await Follow.countDocuments({ follower: user._id, status: 'accepted' });

            userData.fullName = undefined;
            userData.bio = undefined;
            userData.website = undefined;
            userData.postsCount = postsCount; // Instagram shows post count even for private
            userData.followers = [];
            userData.following = [];
            userData.followersCount = followersCount;
            userData.followingCount = followingCount;
            userData.isPrivateAndNotFollowing = true;
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
        
        const wasPrivate = user.isPrivate;
        if (isPrivate !== undefined) {
            user.isPrivate = isPrivate === 'true' || isPrivate === true;
        }

        // If switching from private to public, auto-accept all pending requests
        if (wasPrivate && !user.isPrivate) {
            await Follow.updateMany(
                { following: user._id, status: 'pending' },
                { status: 'accepted' }
            );
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
            // Unfollow or cancel request
            await existingFollow.deleteOne();
            res.json({
                message: existingFollow.status === 'pending' ? 'Request cancelled' : 'Unfollowed',
                isFollowing: false,
                followStatus: 'none',
            });
        } else {
            // New follow — pending for private accounts, accepted for public
            const status = targetUser.isPrivate ? 'pending' : 'accepted';
            await Follow.create({
                follower: currentUserId,
                following: targetUserId,
                status,
            });
            res.json({
                message: status === 'pending' ? 'Follow request sent' : 'Followed',
                isFollowing: status === 'accepted',
                followStatus: status,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pending follow requests for the current user
const getFollowRequests = async (req, res) => {
    try {
        const requests = await Follow.find({
            following: req.user._id,
            status: 'pending',
        })
            .populate('follower', 'username profilePicture fullName')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Accept a follow request
const acceptFollowRequest = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const follow = await Follow.findOne({
            _id: requestId,
            following: req.user._id,
            status: 'pending',
        });

        if (!follow) {
            return res.status(404).json({ message: 'Follow request not found' });
        }

        follow.status = 'accepted';
        await follow.save();

        res.json({ message: 'Follow request accepted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject (delete) a follow request
const rejectFollowRequest = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const follow = await Follow.findOne({
            _id: requestId,
            following: req.user._id,
            status: 'pending',
        });

        if (!follow) {
            return res.status(404).json({ message: 'Follow request not found' });
        }

        await follow.deleteOne();

        res.json({ message: 'Follow request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateProfile,
    followUser,
    getFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
};
