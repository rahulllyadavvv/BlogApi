import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    register,
    login,
    logout,
    forgetPassword,
    resetPasswordWithOtp,
    refreshAccessToken,
    updatePassword,
    updateUserDetails,
    uploadUserAvatar
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";  //multer midleware

const router = express.Router();

router.route("/").post(register);
router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPasswordWithOtp").post(resetPasswordWithOtp);
router.route("/login").post(login);
router.route("/updatePassword").post(verifyJWT, updatePassword);
router.route("/updateUserDetails").post(verifyJWT, updateUserDetails);
router.route("/refreshAccessToken").post(verifyJWT, refreshAccessToken);
router.route("/logout").post(verifyJWT, logout);
router.route("/uploadAvatar").post(verifyJWT,upload.fields([{ name: "avatar", maxCount: 1 }]), uploadUserAvatar);

export default router;
