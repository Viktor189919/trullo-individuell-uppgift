import type { Request, Response } from "express";
import mongoose from "mongoose"
import * as z from "zod";
import { User } from "../models/models.js"
import { UserValidator } from "../validation/validators.js";
import type { UserType } from "../types/types.js"
import { isDuplicationError } from "../utils/mongoErrors.js";

export async function createUser(req : Request, res : Response) {

    try {
    
        UserValidator.parse(req.body)

        const user = await User.create(req.body)

        return res.status(201).json({message: "User created successfully", data: user})

    } catch (error : unknown) {

        if (error instanceof z.ZodError) {
            //Get errors from all fields that failed validation
            const validationErrors = error.issues.map(issue => issue.message)
            return res.status(400).json({message: validationErrors})
        }

        if (isDuplicationError(error)) {
            //Get name of field that caused error
            const field = Object.keys(error.keyValue)[0]
            return res.status(409).json({message: `A user with that ${field} already exist`})
        }

        console.error("Error from route '/users POST(createUser)'", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getUserById(req : Request<{ id : string }>, res : Response) {
     
    try {
    
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        const user = await User.findById(id)

        return res.status(200).json({data: user})

    } catch (error : unknown) {
        console.error("Error from route '/users GET(getUserById)'", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function updateUserById(req : Request<{ id : string }, {}, Partial<UserType>>, res : Response) {
    
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        UserValidator.partial().parse(req.body)

        const updatedUser = await User.findByIdAndUpdate(id, req.body, {new: true})

        return res.status(200).json({data: updatedUser})

    } catch (error : unknown) {
        
        if (error instanceof z.ZodError) {
            //Get errors from all fields that failed validation
            const validationErrors = error.issues.map(issue => issue.message)
            return res.status(400).json({message: validationErrors})
        }

        if (isDuplicationError(error)) {
            //Get name of field that caused error
            const field = Object.keys(error.keyValue)[0]
            return res.status(409).json({message: `A user with that ${field} already exist`})
        }

        console.error("Error from route '/users PATCH(updateUserById)'", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteUserById(req : Request, res : Response) {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        await User.deleteOne({ _id: id })

        return res.status(200).json({message: "User deleted successfully"})

    } catch (error : unknown) {
        console.error("Error from route '/users DELETE(deleteUserById)'", error);
        return res.status(500).json({message: "Internal server error"})
    }
}