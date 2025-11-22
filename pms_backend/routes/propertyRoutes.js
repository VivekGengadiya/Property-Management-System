import { Router } from "express";
import {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getOwnerStats
} from "../controllers/propertyController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/", protect, upload.single("image"), createProperty);





router.post("/", createProperty);
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);
router.get("/dashboard-stats/:ownerId", getOwnerStats);

export default router;
