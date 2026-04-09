const mongoose = require('mongoose');
const postSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type:{
            type: String,
            enum: ['post','reel'],
            default: 'post'
        },
        mediaUrl:{
            type:String,
            required: true,
        },
        caption:{
            type:String,
            default: '',
        },
        location:{
            type: String,
            default: '',
        },
        tags:[String],
        likes:[
            {type:mongoose.Schema.Types.ObjectId,
                ref:'User',
            }
        ],
        comments : [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
            }
        ]
    },
    {timestamps:true}
);

module.exports = mongoose.model('Post',postSchema);