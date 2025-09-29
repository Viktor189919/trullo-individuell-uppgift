import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { ZodError } from "zod";
import { User, Task } from "../models/models.js";
import { CreateUserSchema, UpdateUserSchema } from "../validation/validators.js";
import { ErrorOrigin } from "../types/errorTypes.js";
import { mongoErrorHandler } from "../utils/mongoErrors.js";
import { zodErrorHandler } from "../utils/zodErrors.js";
import { MongoServerError } from "mongodb";
import type { Request, Response } from "express";
import type { CreateUserType, UpdateUserType } from "../validation/validators.js";

dotenv.config()

export async function createUser(req : Request<{}, {}, CreateUserType>, res : Response) {

    try {
        
        const validBody = CreateUserSchema.parse(req?.body)

        const { password } = validBody;

        if (!process.env.SALT_ROUNDS) {
            throw new Error("Salt rounds are not defined in env variables")
        }

        const hash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))

        const user = await User.create({...validBody, password: hash})

        return res.status(201).json({message: "User created successfully", data: user})

    } catch (error : unknown) {

        if (error instanceof ZodError) {
            const validationErrors = zodErrorHandler(error)
            return res.status(400).json({errors: validationErrors})
        }

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.USERS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/users POST(createUser)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getUserById(req : Request<{ id : string }>, res : Response) {
     
    try {
    
        const { id } = req?.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        return res.status(200).json({data: user})

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.USERS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/users/:id GET(getUserById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function updateUserById(req : Request<{ id : string }, {}, UpdateUserType>, res : Response) {
    
    try {

        const { id } = req?.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        const validBody = UpdateUserSchema.parse(req?.body)

        const updatedUser = await User.findByIdAndUpdate(id, validBody, {new: true})

        if (!updatedUser) {
            return res.status(404).json({message: "User not found"});
        }

        return res.status(200).json({data: updatedUser})

    } catch (error : unknown) {
        
        if (error instanceof ZodError) {
            const validationErrors = zodErrorHandler(error)
            return res.status(400).json({message: validationErrors})
        }

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.USERS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/users/:id PATCH(updateUserById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteUserById(req : Request<{ id : string }>, res : Response) {

    try {

        const { id } = req?.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"});
        }

        const userToDelete = await User.findByIdAndDelete(id);

        if (!userToDelete) {
            return res.status(404).json({message: "User not found"});
        }

        await Task.updateMany({ assignedTo: userToDelete.id }, {assignedTo: null})

        return res.status(200).json({message: "User deleted successfully"});

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.USERS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/users/:id DELETE(deleteUserById)': ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}