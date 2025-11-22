import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
    createLease,
    getMyLeases,
    getLandlordLeases,
    respondToLease,
    terminateLease,
} from "../controllers/leaseController.js";

const router = Router();

// LANDLORD: Create lease after approving application
router.post(
    "/",
    protect,
    authorizeRoles("LANDLORD"),
    upload.fields([{ name: "docs", maxCount: 5 }]),
    createLease
);

// TENANT: View my leases
router.get("/my", protect, authorizeRoles("TENANT"), getMyLeases);

// LANDLORD: View all leases
router.get("/landlord", protect, authorizeRoles("LANDLORD"), getLandlordLeases);

// TENANT: Accept or reject lease
router.put("/:id/respond", protect, authorizeRoles("TENANT"), respondToLease);

// LANDLORD: Terminate lease
router.put("/:id/terminate", protect, authorizeRoles("LANDLORD"), terminateLease);

// GET /api/payments/latest/:invoiceId
router.get("/latest/:invoiceId", async (req, res) => {
    try {
        const { invoiceId } = req.params;

        const payment = await Payment.findOne({ invoiceId })
            .sort({ createdAt: -1 }) // latest payment
            .lean();

        res.json({ success: true, payment });
    } catch (error) {
        console.error("Error fetching latest payment", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


export default router;
