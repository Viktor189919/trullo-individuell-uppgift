import { Router } from "express";
import { getUserById, createUser, updateUserById, deleteUserById } from "../controllers/userControllers.js";
import { authorizeUser } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:id", authorizeUser,getUserById);

router.post("/", createUser);

router.patch("/:id", authorizeUser, updateUserById);

router.delete("/:id", authorizeUser, deleteUserById);

export default router;