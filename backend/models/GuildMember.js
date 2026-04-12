const mongoose = require('mongoose')
const guildMemberSchema=new mongoose.Schema(
    {
        guild:{type:mongoose.Schema.Types.ObjectId,ref:'Guild',required:true},
        user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
        role:{type:String,enum:['admin','moderator','member'],default:'member'},

    },
    {timestamps:true}
);
guildMemberSchema.index({guild:1,user:1},{unique:true});
module.exports = mongoose.model('GuildMember',guildMemberSchema);