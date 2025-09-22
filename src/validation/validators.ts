import * as z from "zod";
import { Types } from "mongoose";
 
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
        title: z.string("Title required")
            .min(1, {message: "Title is required"})
            .max(20, {message: "Title cannot be more than 20 characters"}),
        description: z.string()
            .max(200, {message: "Description cannot be more than 200 characters"}).optional(),
        status: z.enum(["to-do", "in progress", "blocked", "done"], {
                    message: "Status is required and can only be one of the string values: 'to-do', 'in progress', 'blocked', 'done'"
                }),
        assignedTo: z.string()
            .refine((val) => Types.ObjectId.isValid(val), {
                message: "Invalid ObjectId",
            })
            .optional()
    }
)

