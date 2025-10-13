import { Router } from "express";
import {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} from "../controllers/propertyController.js";

const router = Router();

router.post("/", createProperty);
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

export default router;
