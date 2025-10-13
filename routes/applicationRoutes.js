import { Router } from "express";
import { createApplication, getApplications } from "../controllers/applicationController.js";

const router = Router();

router.post("/", createApplication);
router.get("/", getApplications);

export default router;
