import { Router } from "express";
import { createUnit, getUnitById, getUnits, updateUnit, deleteUnit } from "../controllers/unitController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";



const router = Router();
router.post("/", protect, upload.single("image"), createUnit);
router.get("/", protect, getUnits);
router.get("/:id", protect, getUnitById);
router.put("/:id", protect, upload.single("image"), updateUnit);
router.delete("/:id", protect, deleteUnit);




export default router;
