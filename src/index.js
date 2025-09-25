import dotenv from "dotenv"
import connectDb from "./db/db.js"
import { app } from "./app.js"

dotenv.config(
    {
        path:"./.env"
    }
)

const port = process.env.PORT||8000;

connectDb()
.then(()=>{
    app.on("error",(error)=>{
        console.error("ERR:",error);
        throw error;
    })
    app.listen(port,()=>{
        console.log(`Server is Running on the PORT: ${port}`)
    })
})
.catch((err)=>{
    console.error(`mongo db connection failed`,err);
});