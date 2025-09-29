import { Router } from "express";
import { getProjectById, getProjects, createProject, updateProjectById, deleteProjectById, getProjectTasks, addProjectMember, getProjectMembers } from "../controllers/projectControllers.js";

const router = Router();

router.get("/", getProjects);

router.get("/:id", getProjectById);

router.post("/", createProject);

router.patch("/:id", updateProjectById);

router.delete("/:id", deleteProjectById);

router.get("/:projectId/tasks", getProjectTasks);

router.patch("/:projectId/users", addProjectMember);

router.get("/:projectId/users", getProjectMembers);

export default router;