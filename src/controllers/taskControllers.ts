import mongoose from "mongoose";
import { ZodError } from "zod";
import { MongoServerError } from "mongodb";
import { mongoErrorHandler } from "../utils/mongoErrors.js";
import { zodErrorHandler } from "../utils/zodErrors.js"
import { Task, Project, User } from "../models/models.js";
import { CreateTaskSchema, UpdateTaskSchema } from "../validation/validators.js";
import { ErrorOrigin } from "../types/errorTypes.js";
import type { Request, Response } from "express";
import type { CreateTaskType, UpdateTaskType } from "../validation/validators.js";


export async function createTask(req : Request<{}, {}, CreateTaskType>, res : Response) {

    try { 

        const validBody = CreateTaskSchema.parse(req?.body);

        const { assignedTo, projectId } = validBody;

        let project;
        if (projectId) {  
            project = await Project.findById(projectId)
            if (!project) {
                res.status(404).json({message: `Could not find a project with id ${projectId}`})
            }
        }

        if (assignedTo) {  
            const isUser = await User.findById(assignedTo)
            if (!isUser) {
                return res.status(404).json({message: `Could not find a user with id ${assignedTo}`})
            }
        }

        const task = await Task.create(validBody);

        if (project) {
            await project.updateOne({$push: {tasks: task.id}})
        }

        return res.status(201).json({message: "Task created successfully", data: task})

    } catch (error : unknown) {

        if (error instanceof ZodError) {
            const validationErrors = zodErrorHandler(error)
            return res.status(400).json({message: validationErrors})            
        }

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.TASKS);
            return res.status(status).json(message)
        }

        console.error("Error from route '/tasks POST(createTask)': ", error);
        res.status(500).json({message: "Internal server error"});
    }
}
export async function getTaskById(req : Request<{ id : string }>, res : Response) {
     
    try {
    
        const { id } = req?.params;

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
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.TASKS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/tasks/:id GET(getTaskById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getTasks(req : Request<{ id : string }>, res : Response) {

    try {

        const tasks = await Task.find({}) 

        return res.status(200).json({data: tasks});

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.TASKS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/tasks GET(getTasks)': ", error);
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function updateTaskById(req : Request<{ id : string }, {}, UpdateTaskType>, res : Response) {
    
    try {

        const { id } = req?.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        const validBody = UpdateTaskSchema.parse(req?.body)

        const { assignedTo } = validBody;

        if (assignedTo) {  
            const isUser = await User.findById(assignedTo)
            
            if (!isUser) {
                return res.status(404).json({message: `Could not find a user with id ${assignedTo}`})
            }
        }

        const updateData = {...validBody} as UpdateTaskType & { finishedAt? : Date};

        if (validBody.status === "done") {
            updateData.finishedAt = new Date
        }

        const updatedTask = await Task.findByIdAndUpdate(id, updateData, {new: true})

        if (!updatedTask) {
            return res.status(404).json({message: "Task not found"})
        }

        return res.status(200).json({data: updatedTask})

    } catch (error : unknown) {
        
        if (error instanceof ZodError) {
            const validationErrors = zodErrorHandler(error)
            return res.status(400).json({message: validationErrors})
        }

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.TASKS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/tasks/:id PATCH(updateTaskById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteTaskById(req : Request<{ id : string}>, res : Response) {

    try {

        const { id } = req?.params;

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
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.TASKS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/tasks/:id DELETE(deleteTaskById)': ", error);
        return res.status(500).json({message: "Internal server error"})
    }
}