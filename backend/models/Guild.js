const mongoose = require('mongoose');
const guildSchema=new mongoose.Schema(
    {
        name:{type:String,required:true},
        description:{type:String,default:''},
        topic:{type:String,required:true},
        type:{type:String,enum:['public','private'],default:'public'},
        owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
        coverImage:{type:String,default:''},
        members:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
        pendingRequests:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
        inviteToken:{type:String,unique:true,sparse:true},

    },
    {timestamps:true}
);
module.exports = mongoose.model('Guild',guildSchema);
