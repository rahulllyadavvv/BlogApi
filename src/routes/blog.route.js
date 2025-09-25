import express from "express"
import { createBlog,getBlogs,getBlogById,deleteBlog,updateBlog,addComment,removeComment,addLike,removeLike,bookmarkBlog,removeBookmark,getallbokmarksofuser,topLikedBlogs,trendingBlogs,mostCommentedBlog,mostActiveAuthors,categoryDistribution, } from "../controllers/blog.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middelware.js";
const router = express.Router();

router.route("/blogs").post(verifyJWT,createBlog);
router.route("/blogs").get(verifyJWT,getBlogs);
router.route("/blogs/:id").get(verifyJWT,getBlogById);
router.route("/blogs/:id").delete(verifyJWT,deleteBlog);
router.route("/blogs/:id").put(verifyJWT,updateBlog);

//comment
router.route("/blogs/:id/comments").post(verifyJWT,addComment);
router.route("/blogs/:blogId/comments/:id").delete(verifyJWT,removeComment);  //comment id /blogid
//like
router.route("/blogs/:id/likes").post(verifyJWT,addLike);              //blogId
router.route("/blogs/:id/removeLike").delete(verifyJWT,removeLike)      //blogId
//bookmarks
router.route("/users/bookmarks/:id").post(verifyJWT,bookmarkBlog);
router.route("/users/bookmarks").get(verifyJWT,getallbokmarksofuser);
router.route("/users/bookmarks/:id").delete(verifyJWT,removeBookmark);
//admin controlls
router.route("/analytics/topliked").get(verifyJWT,isAdmin,topLikedBlogs);
router.route("/analytics/trending").get(verifyJWT,isAdmin,trendingBlogs);
router.route("/analytics/mostCommented").get(verifyJWT,isAdmin,mostCommentedBlog);
router.route("/analytics/mostActiveAuthors").get(verifyJWT,isAdmin,mostActiveAuthors);
router.route("/analytics/categoryDistribution").get(verifyJWT,isAdmin,categoryDistribution)

export default router;




