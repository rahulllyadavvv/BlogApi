import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";


export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
     const token = req.cookies?.accessToken || req.Header("Authorization")?.replace("Bearer ","").trim();
     if(!token){
         throw new apiError(
             401,
             "Unauthorized Request"
         )
     }
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     const user = await  User.findById(decodedToken?._id);
     if(!user){
         throw new apiError(
             401,
             "Invalid Access Token"
         )
     }
 
     req.user = user;
     next();
   } catch (error) {
    throw new apiError( 
        401,
        error.message || "Invalid Access Token" 
    )  
   }

})

