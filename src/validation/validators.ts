import * as z from "zod";
import mongoose from "mongoose";
 
export const CreateUserSchema = z.object(
    {
        name: z.string({
            error: (issue) => issue.input === undefined ? "Name is required" : "Name must be of type string"
        })
            .min(4, {message: "Name must be atleast 4 characters"})
            .max(30, {message: "Name cannot be more than 30 characters"}),
        email: z.email({
            error: (issue) => issue.input === undefined ? "Email is required" : "Email must be of type string"
        }),
        password: z.string({
            error: (issue) => issue.input === undefined ? "Password is required" : "Password must be of type string"
        })
            .min(8, {message: "Password must be at least 8 characters"})
            .max(64, {message: "Password cannot be more than 64 characters"})
    }
)

export const UpdateUserSchema = z.object(
    {
        name: z.string("Name must be of type string")   
            .min(4, {message: "Name must be atleast 4 characters"})
            .max(30, {message: "Name cannot be more than 30 characters"})
            .optional(),
        email: z.email("Email must be a valid email address")
            .optional(),
    }
)

export const AuthUserSchema = z.object(
    {
        email: z.string({
            error: (issue) => issue.input === undefined ? "Email is required" : "Email must be of type string"
        }),
        password: z.string({
            error: (issue) => issue.input === undefined ? "Password is required" : "Password must be of type string"
        })
    }
)

export const CreateTaskSchema = z.object(
    {
        title: z.string({
            error: (issue) => issue.input === undefined ? "Title is required" : "Title must be of type string"
        })
            .max(40, {message: "Title cannot be more than 40 characters"}),
        description: z.string()
            .max(100, {message: "Description cannot be more than 100 characters"})
            .optional(),
        status: z.enum(["to-do", "in progress", "blocked", "done"], {
                    message: "Status can only be one of the string values: 'to-do', 'in progress', 'blocked', 'done'"
                })
                .default("to-do"),
        assignedTo: z.string("AssignedTo must be of type string")
            .refine((val) => mongoose.isValidObjectId(val), {
                message: "AssignedTo is not a valid ObjectId",
            })
            .optional(),
        projectId: z.string("Project id must be of type string")
            .refine((val) => mongoose.isValidObjectId(val), {
                message: "ProjectId is not a valid ObjectId"
            })
            .optional()
    }
)

export const UpdateTaskSchema = z.object(
    {
        title: z.string("Title must be of type string")     
            .max(40, {message: "Title cannot be more than 40 characters"})
            .optional(),
        description: z.string("Description must be of type string")     
            .max(100, {message: "Description cannot be more than 100 characters"})
            .optional(),
        status: z.enum(["to-do", "in progress", "blocked", "done"], {       
            message: "Status can only be one of the string values: 'to-do', 'in progress', 'blocked', 'done'"
        })
            .optional(),
        assignedTo: z.string("AssignedTo must be of type string")
            .refine((val) => mongoose.isValidObjectId(val), {
                message: "AssignedTo is not a valid ObjectId",  
            })
            .optional(),
        projectId: z.string("Project id must be of type string")
            .refine((val) => mongoose.isValidObjectId(val), {   
                message: "ProjectId is not a valid ObjectId"
            })
            .optional()
    }
)

export const CreateProjectSchema = z.object(
    {
         title: z.string({
            error: (issue) => issue.input === undefined ? "Title is required" : "Title must be of type string"
        })
            .max(40, {message: "Title cannot be more than 40 characters"}),
        description: z.string()
            .max(200, {message: "Description cannot be more than 200 characters"}).optional(),
        status: z.enum(["open", "closed"], {
            message: "Status can only be one of the string values: 'open', 'closed'"
        })
            .default("open")
    }
)

export const UpdateProjectSchema = z.object(
    {
        title: z.string("Title must be of type string")
            .max(40, {message: "Title cannot be more than 40 characters"})
            .optional(),
        description: z.string("Description must be of type string")
            .max(200, {message: "Description cannot be more than 200 characters"})
            .optional(),
        status: z.enum(["open", "closed"], {
            message: "Status can only be one of the string values: 'open', 'closed'"
        })
            .optional()
    }
)

export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type UpdateUserType = z.infer<typeof UpdateUserSchema>;
export type AuthUserType = z.infer<typeof AuthUserSchema>;

export type CreateTaskType = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskType = z.infer<typeof UpdateTaskSchema>;

export type CreateProjectType = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectType = z.infer<typeof UpdateProjectSchema>;

