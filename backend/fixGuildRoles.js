const mongoose = require('mongoose');
const Guild = require('./models/Guild');
const GuildMember = require('./models/GuildMember');
require('dotenv').config();

const fixDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/socialmedia');
        console.log('Connected to DB');

        const guilds = await Guild.find({});
        for (const guild of guilds) {
            const ownerId = guild.owner.toString();
            // Demote anyone who is not the owner
            await GuildMember.updateMany(
                { guild: guild._id, user: { $ne: ownerId } },
                { $set: { role: 'member' } }
            );

            // Ensure owner is admin
            await GuildMember.updateOne(
                { guild: guild._id, user: ownerId },
                { $set: { role: 'admin' } }
            );
        }

        console.log('Guild roles fixed!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixDB();
