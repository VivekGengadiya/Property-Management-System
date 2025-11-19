import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  createApplication,
  getMyApplications,
  getMyApplicationById,
  deleteMyPendingApplication,
  // landlord
  getLandlordApplications,
  approveApplication,
  rejectApplication,
  generateApplicationPdf
} from "../controllers/applicationController.js";

const router = Router();

// TENANT create (multipart)
router.post(
  "/",
  protect,
  authorizeRoles("TENANT"),
  upload.fields([{ name: "docs", maxCount: 5 }]),
  createApplication
);

// TENANT list own apps
router.get("/my", protect, authorizeRoles("TENANT"), getMyApplications);




// ─── LANDLORD ROUTES MUST COME BEFORE ANY `/:id` ROUTES ───
router.get("/landlord",           protect, authorizeRoles("LANDLORD", "OWNER"), getLandlordApplications);
router.patch("/:id/approve",      protect, authorizeRoles("LANDLORD", "OWNER"), approveApplication);
router.patch("/:id/reject",       protect, authorizeRoles("LANDLORD", "OWNER"), rejectApplication);

// TENANT single app and delete (dynamic `:id` last)
router.get("/:id",                protect, authorizeRoles("TENANT"), getMyApplicationById);
router.delete("/:id",             protect, authorizeRoles("TENANT"), deleteMyPendingApplication);

router.get("/:id/pdf", generateApplicationPdf);

export default router;
