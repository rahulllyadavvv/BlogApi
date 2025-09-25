import mongoose from "mongoose";
const blogSchema = new mongoose.Schema({
    
    title:{
        type:String,
        required:true,
        trim:true
    },
    content:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    comments:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
            text:{
                type:String
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ],
    views:{
        type:Number,
        default:0
    }

},{
    timestamps:true
})

export const Blog = mongoose.model("Blog",blogSchema);