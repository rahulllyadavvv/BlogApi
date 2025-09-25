import { access } from "fs";
import { User } from "../model/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions } from "../utils/tokenUtils.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import cloudinary from "cloudinary";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
dotenv.config(); //most imp

//phase1 - //genrate acess and refresh token ,resiter,login ,logout ,refreshaccesstoken
//phase 2 - forget password using mail and otp ,change password after sign in,update details,upload user avtaar using cloudinary

const generateAccessAndRefreshToken = async(user)=>{
   try {
     const accessToken = user.generateAccessToken();
     const refreshToken = user.generateRefreshToken();
    user.refreshToken.push(refreshToken);
     await user.save({validateBeforeSave:false})
     return{accessToken,refreshToken}
   } catch (error) {
    throw new apiError(
        500,
        "Something Went Wrong not able to genrate Acess and Refresh Token "
    ) }
}



// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const sendOtpMail = async (to, otp) => {
  const mailOptions = {
    from: process.env.SMTP_USER, // must match the Ethereal account
    to,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("OTP sent to:", to);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info)); // <-- this gives you the Ethereal preview link
  } catch (error) {
    console.error("Email send error:", error.message);
    throw new Error("Failed to send OTP email. Try again Later");
  }
};

/////////////////////////////////////////////////////////////


export const register = asyncHandler(async(req,res)=>{
    const{userName,email,password,role} = req.body;
    if(!userName || !email || !password ||!role){
        throw new apiError(
            401,
            "All fields are required"
        )
    }
    const userExists = await User.findOne({$or:[{userName},{email}]})
    if(userExists){
        throw new apiError(
            409,
            "User already  exists"
        )
    }
    const user = await  User.create({userName,email,password,role});
    await user.save();

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            user,
            "User registered"
        )
    )

})


export const login = asyncHandler(async(req,res)=>{
    const{userName,email,password} = req.body;
    if(!userName && !email){
        throw new apiError(
            401,
            "Email or username is required to login"
        )
    }
    if(!password){
        throw new apiError(
            401,
            "Enter the password to login"
        )
    }

    const user = await User.findOne({$or:[{userName},{email}]})
    if(!user){
        throw new apiError(
            401,
            "Register first to login"   
        )
    }
   const isPassValid = await user.isPasswordCorrect(password);
   if(!isPassValid){
    throw new apiError(
        400,
        "Invalid Credentials"
    )
   }
    const{accessToken,refreshToken} = await generateAccessAndRefreshToken(user);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    user.refreshToken.push(refreshToken);

    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new apiResponse(
            200,
            {user:loggedInUser,
            accessToken: accessToken,
            refreshToken: refreshToken
        },
            "User Logged In "
        ))

})

export const forgetPassword = asyncHandler(async(req,res)=>{
    const {userName,email} = req.body;
    if(!userName || ! email){
        throw new apiError(
            400,
            "userName and email are required "
        )
    }


    const user = await  User.findOne({userName});
    if(!user){
        throw new apiError(
            404,
            "no such user present "
        )
    }
    if(user.email !== email){
        throw new apiError(400,"Enter the registered email")
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    
    user.otp = hashedOtp;
    user.otpExpiry = Date.now()+10*60*1000;
    await user.save({validateBeforeSave:false});


   try {
     await sendOtpMail(email,otp);
   } catch (error) {
    console.error("Failed to send OTP email:",error.message);
    throw new apiError(500,"Failed to send OTP email.Try again Later")
    
   }
    return res
    .status(200)
    .json( 
        new apiResponse(
            200,
            {},
            "otp sent"
        ))

})

export const resetPasswordWithOtp = asyncHandler(async(req,res)=>{
    const{userName,email,otp} = req.body;
    if(!userName || !email || !otp){
        throw new apiError(
            400,
            "all fields are required"
        )
    }

    const user = await User.findOne({userName});
    if(!user){
        throw new apiError(
            400,
            "invalid username"
        )
    }
    if(email !== user.email){
        throw new apiError(
            400,
            "invalid email! enter the registered email"
        )
    }

    const hashedotp = crypto.createHash("sha256").update(otp).digest("hex");

    if(user.otp !== hashedotp){
        throw new apiError(
            400,
            "invalid otp"

        )   
    }

    if(user.otpExpiry < Date.now()){
        throw new apiError(
            400,
            "otp expired"
        )
    }
    const {newPassword} = req.body;
    if(! newPassword){
        throw new apiError(
            400,
            "Enter the new password "
        )
    }
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
         new apiResponse(
            200,
            {},
            "password updated "

        )
    )
})



export const logout =  asyncHandler(async(req,res)=>{
    if(!req.user){
        throw new apiError(
            401,
            "Unauthorized"
        )
    }
    await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken:undefined
        },
        {
            new:true
        }
    )
    return res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(
        new apiResponse(
            200,
            {},
            "User Logged Out"
        )
    )

})

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new apiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new apiError(401, "User not found");
  }
  console.log("user:", user);
  console.log("Stored Refresh Token:", user.refreshToken);
  console.log("Incoming Refresh Token:", incomingRefreshToken);

  if (!user.refreshToken.includes(incomingRefreshToken)) {
    throw new apiError(401, "Refresh token does not match. Please login again.");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  console.log("New Access Token:", accessToken);
    console.log("New Refresh Token:", refreshToken);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new apiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
});


////phase2

export const updatePassword = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);
    if(!user){
        throw new apiError(
            401,
            "login first to change the password"
        )
    }

    const{oldPassword,newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new apiError(
            400,
            "old and new password are required !"
        )
    }

    const validateOldPassword = await  bcrypt.compare(oldPassword,user.password);
    if(!validateOldPassword){
        throw new apiError(
            400,
            "incorrect old password"
        )
    }
    user.password = await bcrypt.hash(newPassword,10);
    await user.save();

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {},
            "password updated"
        )
    )
})

export const updateUserDetails = asyncHandler(async(req,res)=>{
    const fields = ["userName","email"];
    const updates = {};

  fields.forEach(field=>{
    if(req.body[field]){
        updates[field] = req.body[field];
    }
  });

  if(Object.keys(updates).length === 0 ){
    throw new apiError(
        400,
        "Atleast one field is required to update "
    )
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
        new:true
    }
  ).select("-password -refreshToken");


  if(!user){
    throw new apiError(401,"Unauthorized ,Please login first.")
  }
 
  await user.save({validateBeforeSave:true});


    return res
    .status(200)
    .json( new apiResponse(
        200,
        user,
        "user details updated"

    ))
})



export const uploadUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new apiError(404, "Sign in first! User not found");

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
      throw new apiError(400, "Avatar file is required");
    }

    // 🔹 Delete previous avatar from Cloudinary if it exists
    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`user_avatars/${publicId}`);
    }

    // 🔹 Upload new avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new apiError(500, "Failed to upload avatar to Cloudinary");
    }

    user.avatar = avatar.secure_url;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
      new apiResponse(200, { avatar: user.avatar }, "Avatar uploaded successfully")
    );
  } catch (error) {
    throw new apiError(500, error.message || "Something went wrong");
  }
};


