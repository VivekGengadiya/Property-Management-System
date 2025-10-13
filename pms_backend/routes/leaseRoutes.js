import { Router } from "express";
import { createLease, getLeases } from "../controllers/leaseController.js";

const router = Router();

router.post("/", createLease);
router.get("/", getLeases);

export default router;
