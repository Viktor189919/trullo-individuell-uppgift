import { Router } from "express"
import { createTask, getTaskById, getTasks, updateTaskById, deleteTaskById } from "../controllers/taskControllers.js"

const router = Router()

router.post("/", createTask)

router.get("/", getTasks)

router.get("/:id", getTaskById)

router.patch("/:id", updateTaskById)

router.delete("/:id", deleteTaskById)

export default router;