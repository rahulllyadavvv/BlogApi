import mongoose from "mongoose"
import { DB_NAME } from "../../../blogapi/constants.js"

const connectDB=async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Mongo db connected")
    } catch (error) {
        console.error(`Mongo Db Connection Failed ${error}`)
        process.exit(1);
        
    }

}
export default connectDB;