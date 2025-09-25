import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { urlencoded } from "express";
const app = express();

app.use(express.json(
   { limit:"16kb"}
))

app.use(express.static(
    "public"
))

app.use(urlencoded({
    extended:true,
    limit:"16kb"
}))

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credentials:true
}))

app.use(cookieParser());


import userRouter from "./routes/user.route.js"
import blogRouter from "./routes/blog.route.js"

app.use("/api/v1/user",userRouter)
app.use("/api/v1",blogRouter)

export {app}

