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
            default: "to-do"
        },
        assignedTo: {type: Schema.Types.ObjectId, ref: "User"},
        projectId: {type: Schema.Types.ObjectId, ref: "Project"}
    },
    {collection: "tasks"}
)

const ProjectSchema = new Schema(
    {
        title: {type: String, required: true},
        members: {
            type: [{type: Schema.Types.ObjectId, ref: "User"}],
            default: []
        },
        tasks: {
            type: [{type: Schema.Types.ObjectId, ref: "Task"}],
            default: []
        },
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open"
        }
    },
    {collection: "projects"}
)


export type UserType = InferSchemaType<typeof UserSchema>;
export type TaskType = InferSchemaType<typeof TaskSchema>;
export type ProjectType = InferSchemaType<typeof ProjectSchema>;

export const User = model<UserType>("User", UserSchema)
export const Task = model<TaskType>("Task", TaskSchema)
export const Project = model<ProjectType>("Project", ProjectSchema)