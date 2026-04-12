const Guild = require('../models/Guild');
const GuildMember = require('../models/GuildMember');
const GuildMessage = require('../models/GuildMessage');
const User = require('../models/User');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');

const createGuild = async (req, res) => {
    try {
        const { name, description, topic, type } = req.body;
        let coverImage = '';
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'SocialMedia/guilds' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            coverImage = result.secure_url;
        }
        
        let inviteToken = null;
        if (type === 'private') {
            inviteToken = crypto.randomBytes(20).toString('hex');
        }
        
        const guild = await Guild.create({
            name, description, topic, type, owner: req.user._id, coverImage, inviteToken, members: [req.user._id],
        });
        
        await GuildMember.create({
            guild: guild._id,
            user: req.user._id,
            role: 'admin',
        });
        
        await guild.populate('owner', 'username profilePicture');
        res.status(201).json(guild);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPublicGuilds = async (req, res) => {
    try {
        const { topic, search } = req.query;
        const filter = { type: 'public' };
        if (topic) filter.topic = topic;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const guilds = await Guild.find(filter)
            .populate('owner', 'username profilePicture')
            .sort({ createdAt: -1 });
            
        const guildWithCounts = await Promise.all(guilds.map(async (guild) => {
            const count = await GuildMember.countDocuments({ guild: guild._id });
            return { ...guild.toObject(), memberCount: count };
        }));
        
        res.json(guildWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyGuilds = async (req, res) => {
    try {
        const memberships = await GuildMember.find({ user: req.user._id }).populate({
            path: 'guild',
            populate: { path: 'owner', select: 'username profilePicture' },
        });
        const guilds = memberships.map(m => m.guild);
        res.json(guilds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGuildById = async (req, res) => {
    try {
        const guild = await Guild.findById(req.params.guildId)
            .populate('owner', 'username profilePicture')
            .populate('members', 'username profilePicture');
            
        if (!guild) {
            return res.status(404).json({ message: 'Guild not found' });
        }
        
        const isMember = guild.members.some(m => m._id.toString() === req.user._id.toString());
        const memberRoles = await GuildMember.find({ guild: guild._id });
        const memberCount = await GuildMember.countDocuments({ guild: guild._id });
        
        const guildData = guild.toObject();
        const isAdmin = memberRoles.find(r => r.user.toString() === req.user._id.toString() && r.role === 'admin');
        const isOwner = guild.owner._id.toString() === req.user._id.toString();

        // Only expose inviteToken to admins or owner
        if (!isAdmin && !isOwner) {
            delete guildData.inviteToken;
        }

        res.json({ ...guildData, memberRoles: memberRoles.map(r => ({ user: r.user, role: r.role })), memberCount, isMember });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const joinGuild = async (req, res) => {
    try {
        const guild = await Guild.findById(req.params.guildId);
        if (!guild) {
            return res.status(404).json({ message: 'Guild not found' });
        }
        
        const userId = req.user._id;
        
        if (guild.members.includes(userId)) {
            return res.status(400).json({ message: 'Already a member' });
        }
        
        if (guild.type === 'public') {
            guild.members.push(userId);
            await guild.save();
            await GuildMember.create({ guild: guild._id, user: userId, role: 'member' });
            res.json({ message: 'Joined guild successfully' });
        } else {
            const { inviteToken } = req.body;
            if (inviteToken && inviteToken === guild.inviteToken) {
                guild.members.push(userId);
                await guild.save();
                await GuildMember.create({ guild: guild._id, user: userId, role: 'member' });
                res.json({ message: 'Joined guild successfully' });
            } else {
                if (guild.pendingRequests.includes(userId)) {
                    return res.status(400).json({ message: 'Request already pending' });
                }
                guild.pendingRequests.push(userId);
                await guild.save();
                res.json({ message: 'Join request sent' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const leaveGuild = async (req, res) => {
    try {
        const guild = await Guild.findById(req.params.guildId);
        if (!guild) return res.status(404).json({ message: 'Guild not found' });
        
        const userId = req.user._id;
        
        if (guild.owner.toString() === userId.toString()) {
            return res.status(400).json({ message: 'Owner cannot leave; transfer ownership first' });
        }
        
        guild.members = guild.members.filter(m => m.toString() !== userId.toString());
        await guild.save();
        await GuildMember.findOneAndDelete({ guild: guild._id, user: userId });
        res.json({ message: 'Left guild' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const handleJoinRequest = async (req, res) => {
    try {
        const { action } = req.body;
        const guild = await Guild.findById(req.params.guildId);
        if (!guild) return res.status(404).json({ message: 'Guild not found' });
        
        const member = await GuildMember.findOne({ guild: guild._id, user: req.user._id });
        if (!member || member.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only' });
        }
        
        const targetUserId = req.params.userId;

        if (!guild.pendingRequests.includes(targetUserId)) {
            return res.status(400).json({ message: 'No pending request from this user' });
        }
        
        guild.pendingRequests = guild.pendingRequests.filter(id => id.toString() !== targetUserId);
        
        if (action === 'approve') {
            guild.members.push(targetUserId);
            await GuildMember.create({ guild: guild._id, user: targetUserId, role: 'member' });
        }
        await guild.save();
        
        res.json({ message: action === 'approve' ? 'User approved' : 'Request rejected' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGuildMessages = async (req, res) => {
    try {
        const guild = await Guild.findById(req.params.guildId);
        if (!guild) return res.status(404).json({ message: 'Guild not found' });
        
        const isMember = guild.members.includes(req.user._id);
        if (!isMember && guild.type === 'private') {
            return res.status(403).json({ message: 'Not a member' });
        }
        
        const limit = parseInt(req.query.limit) || 50;
        const messages = await GuildMessage.find({ guild: req.params.guildId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('sender', 'username profilePicture');
            
        res.json(messages.reverse());

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const joinGuildByToken = async (req, res) => {
    try {
        const { inviteToken } = req.params;
        const guild = await Guild.findOne({ inviteToken });
        
        if (!guild) {
            return res.status(404).json({ message: 'Invalid invite link' });
        }
        
        const userId = req.user._id;
        if (guild.members.includes(userId)) {
            return res.json({ message: 'Already a member', guildId: guild._id });
        }
        
        guild.members.push(userId);
        // Remove from pending if they were there
        guild.pendingRequests = guild.pendingRequests.filter(id => id.toString() !== userId.toString());
        await guild.save();
        
        await GuildMember.create({ guild: guild._id, user: userId, role: 'member' });
        
        res.json({ message: 'Joined guild successfully', guildId: guild._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGuild = async (req, res) => {
    try {
        const guild = await Guild.findById(req.params.guildId);
        if (!guild) return res.status(404).json({ message: 'Guild not found' });
        
        const member = await GuildMember.findOne({ guild: guild._id, user: req.user._id });
        if (!member || member.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only' });
        }
        
        const { name, description, topic, type } = req.body;
        if (name) guild.name = name;
        if (description) guild.description = description;
        if (topic) guild.topic = topic;
        if (type) {
            guild.type = type;
            if (type === 'private' && !guild.inviteToken) {
                guild.inviteToken = crypto.randomBytes(20).toString('hex');
            }
        }
        
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'SocialMedia/guilds' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            guild.coverImage = result.secure_url;
        }
        
        await guild.save();
        res.json(guild);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteGuild = async (req, res) => {
    try {
        const guild = await Guild.findById(req.params.guildId);
        if (!guild) return res.status(404).json({ message: 'Guild not found' });
        
        if (guild.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Owner only' });
        }
        
        await Guild.findByIdAndDelete(req.params.guildId);
        await GuildMember.deleteMany({ guild: req.params.guildId });
        await GuildMessage.deleteMany({ guild: req.params.guildId });
        
        res.json({ message: 'Guild deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const transferOwnership = async (req, res) => {
    try {
        const { newOwnerId } = req.body;
        const guild = await Guild.findById(req.params.guildId);
        if (!guild) return res.status(404).json({ message: 'Guild not found' });
        
        if (guild.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Owner only' });
        }
        
        if (!guild.members.includes(newOwnerId)) {
            return res.status(400).json({ message: 'New owner must be a member' });
        }
        
        // Update guild owner
        guild.owner = newOwnerId;
        await guild.save();
        
        // Ensure new owner is an admin in GuildMember role too
        await GuildMember.findOneAndUpdate(
            { guild: guild._id, user: newOwnerId },
            { role: 'admin' }
        );
        
        res.json({ message: 'Ownership transferred' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGuild, getPublicGuilds, getMyGuilds, getGuildById,
    joinGuild, leaveGuild, handleJoinRequest, getGuildMessages,
    joinGuildByToken, updateGuild, deleteGuild, transferOwnership
};