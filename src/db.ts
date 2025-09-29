import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectDB() {
    
    if (!process.env.MONGODB_URI) {
        throw new Error("Missing MONGODB_URI");
    } 

    if (!process.env.DB_NAME) {
        throw new Error("Missing DB_NAME");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME,
    })
    console.log("Connected to MongoDB")
}