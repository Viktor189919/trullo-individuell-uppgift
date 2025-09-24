import type { Request, Response} from "express";
import type { TaskType } from "../types/types.js"
import mongoose from "mongoose"
import * as z from "zod";
import { ProjectValidator, TaskValidator } from "../validation/validators.js";
import { Project, Task, User } from "../models/models.js";
import { MongoServerError } from "mongodb";
import { mongoErrorHandler } from "../utils/mongoErrors.js";

// CRUD for projects

export async function createProject(req : Request, res : Response) {

    try {

        ProjectValidator.parse(req.body);

        const project = await Project.create(req.body);

        return res.status(201).json({message: "Project created successfully", data: project})

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

        console.error("Error from route '/projects POST(createProject)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getProjects(req : Request, res : Response) {
    
    try {

        const project = await Project.find()

        return res.status(200).json({data: project})

    } catch (error : unknown)  {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:id GET(getProjectById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getProjectById(req : Request, res : Response) {
    
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"})
        }

        const project = await Project.findById(id)

        if (!project) {
            return res.status(404).json({message: "Project not found"})
        }

        return res.status(200).json({data: project})

    } catch (error : unknown)  {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:id GET(getProjectById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function updateProjectById(req : Request, res : Response) {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"});
        }

        ProjectValidator.partial().parse(req.body);

        const updatedProject = await Project.findByIdAndUpdate(id, req.body, {new: true});

        if (!updatedProject) {
            return res.status(404).json({message: "Project not found"})
        }

        return res.status(200).json({data: updatedProject})

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

        console.error("Error from route '/projects/:id PATCH(updateProjectById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

//Delete project with belonging tasks
export async function deleteProjectById(req : Request, res : Response) {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"});
        }

        const project = await Project.findById(id)

        if (!project) {
            return res.status(404).json({message: "Project not found"})
        }

        await Task.deleteMany({_id: {$in: project.tasks}});

        await project.deleteOne();

        return res.status(200).json({message: "Project deleted successfully"})
 
    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:id DELETE(deleteProjectById)': ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}
 
export async function getProjectTasks(req : Request, res : Response) {

    try {

        const { projectId } = req.params;

        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"});
        }

        const project = await Project.findById(projectId)
            .populate("tasks");
        
        if (!project) {
            return res.status(404).json({message: "Project not found"})
        }

        return res.status(200).json({data: project.tasks})

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:projectId/tasks GET(getProjectTasks)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

// READ and add for project members

export async function addProjectMember(req : Request<{ projectId : string }, {}, { userId : string }>, res : Response) {

    try {

        const { projectId } = req.params;

        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({message: "ProjectId is not a valid ObjectId"});
        }

        const { userId } = req.body;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({message: "UserId is not a valid ObjectId"});
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({message: "Project not found"});
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        await project.updateOne({$push: {members: user.id}})

        return res.status(200).json({message: "New member has been added"})

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:projectId/users PATCH(addProjectMember)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getProjectMembers(req : Request, res : Response) {

    try {

        const { projectId } = req.params;

        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({message: "ProjectId is not a valid ObjectId"});
        }

        const project = await Project.findById(projectId).populate("members");

        if (!project) {
            return res.status(404).json({message: "Project not found"});
        }

        return res.status(200).json({data: project.members})

    } catch (error : unknown) {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:projectId/users GET(getProjectMembers)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}