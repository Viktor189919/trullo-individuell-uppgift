import { Router } from "express"
import { getUserById, createUser, updateUserById, deleteUserById } from "../controllers/userControllers.js"

const router = Router()

router.get("/:id", getUserById)

router.post("/", createUser)

router.patch("/:id", updateUserById)

router.delete("/:id", deleteUserById)

export default router;