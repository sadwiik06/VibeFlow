const mongoose = require('mongoose');
const guildMessageSchema = new mongoose.Schema(
    {
        guild:{type:mongoose.Schema.Types.ObjectId,ref:'Guild',required:true},
        sender:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
        text:{type:String,required:true},
    },
    {timestamps:true}
);

module.exports = mongoose.model('GuildMessage',guildMessageSchema);