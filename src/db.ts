import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export default async function connectDB() {
    
    if (!process.env.MONGODB_URI) {
        throw new Error("Missing MONGODB_URI");
    } 

    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "trullo",
    })
    console.log("Connected to MongoDB")
}