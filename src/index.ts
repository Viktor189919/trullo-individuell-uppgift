import express from "express";
import mongoose from "mongoose";
import connectDB from "./db.js"
import taskRouter from "./routes/taskRoutes.js"
import userRouter from "./routes/userRoutes.js"

const app = express();

app.use(express.json())
app.use("/tasks", taskRouter)
app.use("/users", userRouter)

await connectDB()
    .then(() => {
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost${PORT}`)
        })
    })
    .catch((error) => {
        console.error(error)
    })