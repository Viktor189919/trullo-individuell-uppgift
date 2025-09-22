import { Schema, model } from "mongoose";
import type { InferSchemaType } from "mongoose"

const UserSchema = new Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true} 
    },
    { collection: "users"}
)

const TaskSchema = new Schema(
    {
        title: {type: String, required: true},
        description: {type: String},
        status: {
            type: String,
            enum: ["to-do", "in progress", "blocked", "done"],
            required: true,
        },
        assignedTo: {type: Schema.Types.ObjectId, ref: "User"},
    },
    {collection: "tasks"}
)

export type UserType = InferSchemaType<typeof UserSchema>;
export type TaskType = InferSchemaType<typeof TaskSchema>;

export const Task = model<TaskType>("Task", TaskSchema)
export const User = model<UserType>("User", UserSchema)