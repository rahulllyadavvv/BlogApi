import { apiError } from "../utils/apiError.js";

export const isAdmin = (req,res,next)=>{
    const user = req.user;
    if(!user){
        throw new apiError(
            401,
            "No user found in request"
        )
    }
    if(user.role !== "admin"){
        throw new apiError(
            403,
            "Unauthorized Admin only "
        )
    }
    next();
};