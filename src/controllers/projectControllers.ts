import mongoose from "mongoose"
import { ZodError } from "zod";
import { MongoServerError } from "mongodb";
import { mongoErrorHandler } from "../utils/mongoErrors.js";
import { zodErrorHandler } from "../utils/zodErrors.js";
import { CreateProjectSchema, UpdateProjectSchema } from "../validation/validators.js";
import { Project, Task, User } from "../models/models.js";
import { ErrorOrigin } from "../types/errorTypes.js";
import type { Request, Response} from "express";
import type { CreateProjectType, UpdateProjectType } from "../validation/validators.js"


export async function createProject(req : Request<{}, {}, CreateProjectType>, res : Response) {

    try {

        const validBody = CreateProjectSchema.parse(req?.body);

        const project = await Project.create(validBody);

        return res.status(201).json({message: "Project created successfully", data: project})

    } catch (error : unknown) {

        if (error instanceof ZodError) {
            const validationErrors = zodErrorHandler(error);
            return res.status(400).json({message: validationErrors})
        }

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.PROJECTS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects POST(createProject)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getProjects(req : Request, res : Response) {
    
    try {

        const project = await Project.find({})

        return res.status(200).json({data: project})

    } catch (error : unknown)  {

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.PROJECTS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:id GET(getProjectById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getProjectById(req : Request, res : Response) {
    
    try {

        const { id } = req?.params;

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
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.PROJECTS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:id GET(getProjectById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function updateProjectById(req : Request<{ id : string }, {}, UpdateProjectType>, res : Response) {

    try {

        const { id } = req?.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Id is not a valid ObjectId"});
        }

        const validBody = UpdateProjectSchema.partial().parse(req?.body);

        const project = await Project.findById(id)

        const updatedProject = await Project.findByIdAndUpdate(id, validBody, {new:true})

        if (!updatedProject) {
            return res.status(404).json({message: "Project not found"})
        }

        return res.status(200).json({data: project})

    } catch (error : unknown) {

        if (error instanceof ZodError) {
            const validationErrors = zodErrorHandler(error);
            return res.status(400).json({message: validationErrors})
        }

        if (error instanceof MongoServerError) {
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.PROJECTS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:id PATCH(updateProjectById)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteProjectById(req : Request, res : Response) {

    try {

        const { id } = req?.params;

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
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.PROJECTS)
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
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.PROJECTS)
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

        if (!userId) {
            return res.status(400).json({message: "UserId is required"});
        }

        if (typeof userId !== "string") {
            return res.status(400).json({message: "UserId must be a string"});
        }

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
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.PROJECTS)
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
            const { status, message } = mongoErrorHandler(error, ErrorOrigin.PROJECTS)
            return res.status(status).json({message: message})
        }

        console.error("Error from route '/projects/:projectId/users GET(getProjectMembers)': ", error)
        return res.status(500).json({message: "Internal server error"})
    }
}