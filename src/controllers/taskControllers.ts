import type { Request, Response } from "express";
import mongoose from "mongoose"
import * as z from "zod";
import { Task } from "../models/models.js"
import { TaskValidator } from "../validation/validators.js";
import type { TaskType } from "../types/types.js"
import { isDuplicationError } from "../utils/mongoErrors.js";

export async function createTask(req : Request, res : Response) {

    try {
    
        TaskValidator.parse(req.body)

        const task = await Task.create(req.body)

        return res.status(201).json({message: "Task created successfully", data: task})

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

        console.error("Error from route '/tasks POST(createTask)'", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getTaskById(req : Request, res : Response) {
     
    try {
    
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        const task = await Task.findById(id)

        return res.status(200).json({data: task})

    } catch (error : unknown) {
        console.error("Error from route '/tasks GET(getTaskById)'", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function updateTaskById(req : Request<{ id : string }, {}, Partial<TaskType>>, res : Response) {
    
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        TaskValidator.partial().parse(req.body)

        const updatedTask = await Task.findByIdAndUpdate(id, req.body, {new: true})

        return res.status(200).json({data: updatedTask})

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

        console.error("Error from route '/tasks PATCH(updateTaskById)'", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteTaskById(req : Request, res : Response) {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        await Task.deleteOne({ _id: id })

        return res.status(200).json({message: "Task deleted successfully"})

    } catch (error : unknown) {
        console.error("Error from route '/tasks DELETE(deleteTaskById)'", error);
        return res.status(500).json({message: "Internal server error"})
    }
}