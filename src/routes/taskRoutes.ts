import { Router } from "express"
import { getTaskById, createTask, updateTaskById, deleteTaskById } from "../controllers/taskControllers.js"

const router = Router()

router.get("/:id", getTaskById)

router.post("/", createTask)

router.patch("/:id", updateTaskById)

router.delete("/:id", deleteTaskById)

export default router;