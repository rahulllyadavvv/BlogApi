import { timeStamp } from "console"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { type } from "os"

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        lowerCase:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    bookmarks:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Blog"
        }
    ],
    otp:{
        type:"string"
    },
    otpExpiry:{
        type:Date
    },
    refreshToken:{
        type:[String]
    }
    
},{timestamps:true}
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();
   this.password = await bcrypt.hash(this.password,10);
    next();

})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}


userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id:this._id,
            userName:this.userName,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);