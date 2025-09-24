import type { Request, Response } from "express";
import mongoose from "mongoose"
import * as z from "zod";
import { Task, Project, User } from "../models/models.js"
import { TaskValidator } from "../validation/validators.js";
import type { TaskType } from "../types/types.js"
import { MongoServerError } from "mongodb"
import { mongoErrorHandler } from "../utils/mongoErrors.js";


export async function createTask(req : Request, res : Response) {

    try { 

        TaskValidator.parse(req.body);

        const task = await Task.create(req.body);

        const { projectId } = req.body;

        if (projectId) {  
            await Project.findByIdAndUpdate(projectId, {$push: {tasks: task.id}})
        }

        return res.status(201).json({message: "Task created successfully", data: task})

    } catch (error : unknown) {

        if (error instanceof z.ZodError) {
            //Get errors from all fields that failed validation
            const validationErrors = error.issues.map(issue => issue.message)
            return res.status(400).json({message: validationErrors})            
        }

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error);
            return res.status(status).json(message)
        }

        console.error("Error from route '/tasks POST(createTask)': ", error);
        res.status(500).json({message: "Internal server error"});
    }
}
export async function getTaskById(req : Request, res : Response) {
     
    try {
    
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({message: "Task not found"})
        }

        return res.status(200).json({data: task})

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/tasks/:id GET(getTaskById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getTasks(req : Request, res : Response) {

    try {

        const tasks = await Task.find({}) 

        return res.status(200).json({data: tasks});

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/tasks GET(getTasks)': ", error);
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

        if (!updatedTask) {
            return res.status(404).json({message: "Task not found"})
        }

        return res.status(200).json({data: updatedTask})

    } catch (error : unknown) {
        
        if (error instanceof z.ZodError) {
            //Get errors from all fields that failed validation
            const validationErrors = error.issues.map(issue => issue.message)
            return res.status(400).json({message: validationErrors})
        }

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/tasks/:id PATCH(updateTaskById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteTaskById(req : Request<{ id : string}>, res : Response) {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "TaskId is not a valid ObjectId"})
        }

        const taskToDelete = await Task.findById(id)

        if (!taskToDelete) {
            return res.status(404).json({message: "Task not found"})
        }

        const { projectId } = taskToDelete;
        
        if (projectId) {

            if (!mongoose.isValidObjectId(projectId)) {
                return res.status(400).json({message: "ProjectId is not a valid ObjectId"})
            }

            await Project.findByIdAndUpdate(projectId, {$pull: { tasks: taskToDelete.id}})
        }

        await taskToDelete.deleteOne();

        return res.status(200).json({message: "Task deleted successfully"})

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/tasks/:id DELETE(deleteTaskById)': ", error);
        return res.status(500).json({message: "Internal server error"})
    }
}