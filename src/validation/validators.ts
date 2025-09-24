import * as z from "zod";
import mongoose from "mongoose";
 
export const UserValidator = z.object(
    {
        name: z.string()
            .min(4, {message: "Name is required must be atleast 4 characters"})
            .max(30, {message: "Name cannot be more than 30 characters"}),
        email: z.email({message: "Email must be of type email"}),
        password: z.string()
            .min(8, {message: "Password is required and must be at least 8 characters"})
            .max(64, {message: "Password cannot be more than 64 characters"})
    }
)

export const TaskValidator = z.object(
    {
        title: z.string("Title must be of type string")
            .min(1, {message: "Title is required"})
            .max(20, {message: "Title cannot be more than 20 characters"}),
        description: z.string()
            .max(200, {message: "Description cannot be more than 200 characters"}).optional(),
        status: z.enum(["to-do", "in progress", "blocked", "done"], {
                    message: "Status can only be one of the string values: 'to-do', 'in progress', 'blocked', 'done'"
                })
                .default("to-do"),
        assignedTo: z.string("AssignedTo must be of type string")
            .refine((val) => mongoose.isValidObjectId(val), {
                message: "Invalid ObjectId",
            })
            .optional()
    }
)

export const ProjectValidator = z.object(
    {
        title: z.string("Title must be of type string")
            .min(1, {message: "Title is required"})
            .max(30, {message: "Title cannot be more than 30 characters"}),
        members: z.array(
                    z.string()
                    .refine((val) => mongoose.isValidObjectId(val), {
                        message: "Invalid ObjectId",
                    })
                )
            .default([]),
        tasks: z.array(
                    z.string("TaskId must be of type string")
                    .refine((val) => mongoose.isValidObjectId(val), {
                        message: "Invalid ObjectId",
                    })
                    )
            .default([]),
        status: z.enum(["open", "closed"], {
            message: "Status can only be one of the string values: 'open', 'closed'"
        })
            .default("open")
    }
)

