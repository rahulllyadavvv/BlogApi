//phase 1 -createblog,getblogbysearchandfilter,getblogbyid,delteblog,updateblog,addcomment,removecomment,addlike,removelike,bookmarkblog,removebookmark,getallbokmarksofuser,
//phase 2(using ai to get these code ) - agggregation pipelines top liked blogs,trending blogs,most commented blogs,most active authors ,category distributions



import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Blog } from "../model/blog.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import {User} from "../model/user.model.js"



export const createBlog = asyncHandler(async(req,res)=>{
    const{title,content,category} = req.body;
    if(!title || !category || !content){
        throw new apiError(
            400,
            "tilte,category,content are required"
        )
    }

    const blog = await Blog.create({title,content,category,author:req.user._id});

    return res
    .status(200)
    .json(new apiResponse(
        200,
        {blog},
        "Blog created"
    ))

});


export const getBlogs = asyncHandler(async(req,res)=>{
    const{search,category,tags,page="1",limit="5",sortBy="createdAt",order="asc"} = req.query;

    const filter = {};
    if(search)filter.$or=[
        {title:{$regex:search,$options:"i"}},
        {content:{$regex:search,$options:"i"}}
    ];

    if(category)filter.category = category;

    if(tags)filter.tags = {$in:tags.split(",")}

    const skip = (page-1)*limit;
    const contentOrder = order === "asc"?1:-1;

    const blogs = await Blog.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({[sortBy]:contentOrder})
    .populate("author","userName")
    .populate("comments.user","username")

    const total = blogs.length;

    return res
    .status(200)
    .json(
    new apiResponse(
    200,
    {
        blogs,
        page:parseInt(page),
        pages:Math.ceil(total/limit)
    },
    "Blogs as per you search and filter"
    ))

})

export const getBlogById = asyncHandler(async(req,res)=>{
    const {id} = req.params;
     if(!id){
        throw new apiError(
            404,
            "blog id is required "
        )
     }
     const blog = await Blog.findById(id)
     .populate("author","userName email avatar")
     .populate("likes","userName")
     .populate("comments.user","userName")

     if(!blog){
        throw new apiError(
            404,
            "Invalid Blog Id"
        )
     }
     blog.views +=1;

     await blog.save({validateBeforeSave:false})
     
     return res
     .status(200)
     .json(
       new apiResponse(
            200,
            { blog},
            "Blog found"
        )
     )

});
export const deleteBlog = asyncHandler(async(req,res)=>{
    const{id} = req.params; //blogid
    if(!id){
        throw new apiError(
            404,
            "Blog id not found! cant delete"
        )
    }
    const blog = await Blog.findById(id);
    if(!blog){
        
        throw new apiError(
            404,
            "Invalid blog id no blog present "
        )
    }
    const user =  await User.findById(req.user._id);
    const isAuthor = blog.author.toString() === user._id.toString();
    const isAdmin = user.role === "admin"

    if(!isAdmin && !isAuthor){
        throw new apiError(
            403,
            "Unauthorized only author and admin can delete the blog "
        )
    }

    await blog.deleteOne();
    

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {},
            "Blog Deleted"
        )
    )
})

export const updateBlog = asyncHandler(async(req,res)=>{
    const {id} = req.params; //blog id;
    const fields = ["title","content","category"]

    if(!id){
        throw new apiError(
            404,
            "Enter the blog id to update the blog"
        )
    }
    const blog = await Blog.findById(id)
    .populate("likes" ,"userName")
    .populate("author","userName email avatar")
    .populate("comments.user","userName")

    if(!blog){
        throw new apiError(
            404,
            "Blog not found"
        )
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw new apiError(
            400,
            "first login to update the blog"
        )
    }

    if(!(blog.author._id.toString() === user._id.toString())){
        throw new apiError(
            401,
            "only blog author  can  update the blog "
        )

    }
    
    fields.forEach(field=>{
        if(req.body[field])blog[field]= req.body[field];
    })

    await blog.save()

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {blog},
            "blog updated"

        )
    )   
});
export const addComment = asyncHandler(async(req,res)=>{

    const {comment} = req.body;
    const {id} = req.params;   //blog id
    if(!comment){
        throw new apiError(
            400,
            "empty comment field"
        )   
    }
    if(!id){
        throw new apiError(
            400,
            "enter the blog id to add the comment"
        )
    }

    const blog = await Blog.findById(id)
    .populate("author","userName")
    .populate("comments.user","userName")

    if(!blog){
        throw new apiError(
            404,
            "no blog present with this id"
        )
    }

    blog.comments.push({
        user:req.user._id,
        comment:comment,
        text:comment

    });

    await blog.save();

    return res
    .status(200)
    .json(
        new apiResponse(

            200,
            {blog},
            "comment added"

        )
    )
})

export const removeComment = asyncHandler(async(req,res)=>{
    const {blogId,id} = req.params; //blog id //comment id 
    if(!id){
        throw new apiError(
            404,
            "comment id not found !can't delete"
        )
    }
    const user = await User.findById(req.user._id);
    if(!user){
        throw new apiError(
            400,
            "login first to delete the comment"
        )
    }

    if(!blogId){
        throw new apiError(
            404,
            "blog id not present "
        )
    }

    const blog = await Blog.findById(blogId)
    .populate("author","userName email avatar")
   
    if(!blog){
        throw new apiError(
            404,
            "blog not found"
        )
    }

    const comment = blog.comments.id(id);
    if(!comment){
        throw new apiError(
            404,
            "comment not presnet "
        )
    }

    const isCommentAuthor = comment.user?.toString() === req.user._id.toString();
  const isBlogAuthor = blog.author?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";


    if(!isCommentAuthor && !isBlogAuthor && !isAdmin){
        throw new apiError(
            401,
            "Unauthorized  !only the blog author,admin,;comment Author can delete the comment "
        )
    }

  
   
    await comment.deleteOne({ _id: id });
    await blog.save();

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {blog},
            "comment deleted"
        )
    )
});

export const addLike = asyncHandler(async(req,res)=>{
    const {id} = req.params;   //blog id
    if(!id){
        throw new apiError(
            404,
            "blog id not found"
        )
    }

    const blog = await Blog.findById(id).populate("author","userName")
    if(!blog){
        throw new apiError(
            404,
            "blog not found"
        )
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw new apiError(
            400,
            "login first to like the blog"
        )
    }

    const alreadyLiked = blog.likes.some(
        (like) => like.toString() === req.user._id.toString()
    )
    if(alreadyLiked){
        throw new apiError(
            400,
            "already liked"
        )
    }

    blog.likes.push(req.user._id);
    await blog.save();

    return res
    .status(200)
    .json(new apiResponse(
        200,
        blog,
        "blog liked"
    ))
});

export const removeLike = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if(!id){
        throw new apiError(
            404,
            "blog id not found can't dislike"
        )
    }
    const blog = await Blog.findById(id);
    if(!blog){
        throw new apiError(
            404,
            "blog not found"
        )
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw new apiError(
            400,
            "login first to dislike "
        )
    }

    const isLiked = blog.likes.some(
        (like) => like.toString() === user._id.toString()
    )
    if(!isLiked){
        throw new apiError(
            400,
            "blog already disliked"
        )

    }
    // one more alternate method
    // await Blog.findByIdAndUpdate(
    //     id,
    //     {$pull:{likes:req.user._id}},
    //     {new:true}
    // );

    blog.likes = blog.likes.filter(
        like=>like.toString() !== req.user._id.toString()
    )

    await blog.save();

    return res
    .status(200)
    .json (new apiResponse(
        200,
        blog,
        "blog Disliked"
    ))

});

export const bookmarkBlog = asyncHandler(async(req,res)=>{
    const {id} = req.params; //blog id
    if(!id){
        throw new apiError(
            404,
            "Enter the blog id to bookmark"
        )
    }
    const blog = await Blog.findById(id);
    if(!blog){
        throw new apiError(
            404,
            "blog not found ! invalid blog id"
        )
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw new apiError(
            400,
            "login first to bookmark blog"
        )
    }

   const isAlreadyBookmarked = user.bookmarks.some(
    (bookmark)=> bookmark.toString() === blog._id.toString()
   )

   if(isAlreadyBookmarked){
    throw new apiError(
        400,
        "already bookmarked"
    )
   }
// alternate method //add to set is a mongo db operator used to add value in array and it avoids duplicates so no need to write code to avoid duplicates and also its  a  mongo db operator so we are directly performing operation in db so its a fast operation 
// const user = User.findByIdAndUpdate(
//     req.user._id,
//     {$addToSet:{bookmarks:blog._id}},
//     {new:true}
// )

   user.bookmarks.push(blog._id);
   await user.save();

   return res
   .status(200)
   .json(new apiResponse(
    200,
    user,
    "blog bookmarked"
   ))
})

export const removeBookmark = asyncHandler(async(req,res)=>{
    const{id} = req.params; //blog id
    if(!id){
        throw new apiError(
            400,
            "enter the bookmark id to remove the bookmark"
        )
    }

    const user = await User.findById(req.user._id);
    if(!user){
        throw  new apiError(
            400,
            "login first to remove the bookmark"
        )
    }

    const isBookmarked  = user.bookmarks.some(
        (bookmark)=> bookmark.toString() === id.toString()
    )

    if(!isBookmarked){
        throw new apiError(
            400,
            "bookmark the blog first to remove bookmark"
        )
    }

    user.bookmarks = user.bookmarks.filter(
        bookmark => bookmark.toString() !== id.toString()

    )

    //alternate method which operates directly on mongo databse helce ita faster method 
//     await User.findByIdAndUpdate(
//   req.user._id,
//   { $pull: { bookmarks: id } },
//   { new: true }
//  );

    await user.save();

    return res
    .status(200)
    .json(new apiResponse(
        200,
        user,
        "bookmark removed"
    ))
   
})

export const getallbokmarksofuser = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id)
    .populate("bookmarks","title author category")

    if(!user){
        throw new apiError(
            400,
            "login first to get all the bookmarks"
        )
    }
    return res
    .status(200)
    .json(
       new apiResponse(
        200,
        user.bookmarks,
        "all bookmarks"

       )
    )
})

/////////phase 2 //////
export const topLikedBlogs = asyncHandler(async(req,res)=>{
    const blogs = await Blog.aggregate([
        {
            $project:{
                title:1,
                author:1,
                likesCount:{$size:"$likes"},
                createdAt:1
            }

        },
        {
            $sort:{likesCount:-1}

        },
        {
            $limit:10

        }
    ]);
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            blogs,
            "Top Liked Blogs"
        )
    )
})

export const trendingBlogs = asyncHandler(async(req,res)=>{
    const blogs = await  Blog.aggregate([
        {
            $addFields:{
                likesCount:{$size:"$likes"},
                ageInDays:{
                    $divide:[
                        {$subtract:[new Date(),"$createdAt"]},
                        100*60*60*24
                    ]

                }
            }
        },
        {
            $addFields:{
                score:{
                    $divide:[
                        {$add:["$views",{$multiply:["$likesCount",2]}]},
                        {$cond:[{$eq:["$ageInDays",0]},1,"$aeInDays"]}
                    ]
                }
            }
        },
        {
            $sort:{score:-1}
        },
        {
            $limit:10
        }
    ]);
    return res
    .status(200)
    .json(new apiResponse(
        200,
        blogs,
        "Trending Blogs"
    ))
})

export const mostCommentedBlog = asyncHandler(async(req,res)=>{
    const blogs = await Blog.aggregate([
        {
            $project:{
                title:1,
                author:1,
               commentsCount:{$size:"$comments"}
            }
        },
        {
            $sort:{commentsCount:-1}
        },
        {
            $limit:10
        }
    ]);

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            blogs,
            "Most Commented Blogs"
        )
    )
});

export const mostActiveAuthors = asyncHandler(async(req,res)=>{
    const authors = await Blog.aggregate([
        {
            $group:{
                _id:"$authors",
                blogCount:{$sum:1},
                totalLikes:{$sum:{size:"$likes"}},
                totalViews:{sum:"$views"}
            }
        },
        {
            $sort:{blogCount:-1,totalLikes:-1,totalViews:-1}
        },
        {
            $limit:10
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            authors,
            "Most Active Authors"
        )
    );
})

export const categoryDistribution = asyncHandler(async(req,res)=>{
    const distribution = await Blog.aggregate([
        {
            $group:{
                _id:"$category",
                count:{$sum:1}
            }
        },
        {
            $sort:{count:-1}
        }
    ]);

    return res
    .status(200)
    .json(new apiResponse(
        200,
        distribution,
        "Category Distribution"
    ));
});
