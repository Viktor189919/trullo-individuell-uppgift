import express from "express";
import connectDB from "./db.js"
import { userRouter, authRouter, taskRouter, projectRouter } from "./routes/index.js"
import { authorizeUser } from "./middleware/authMiddleware.js"

const app = express();

app.use(express.json())
app.use("/tasks", authorizeUser, taskRouter)
app.use("/users", userRouter)
app.use("/projects", authorizeUser, projectRouter)
app.use("/auth", authRouter)

await connectDB()
    .then(() => {
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        })
    })
    .catch((error) => {
        console.error(error)
    })