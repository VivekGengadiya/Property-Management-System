import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    createPayment,
    getMyPayments,
    getLandlordPayments,
    getPaymentById,
    handleStripeWebhook
} from "../controllers/paymentController.js";

const router = Router();

// 💳 Tenant creates payment
router.post("/", protect, authorizeRoles("TENANT"), createPayment);

// 👤 Tenant views all payments
router.get("/my", protect, authorizeRoles("TENANT"), getMyPayments);

// 🏠 Landlord views all payments for their properties
router.get("/landlord", protect, authorizeRoles("LANDLORD"), getLandlordPayments);

// 🔍 Get single payment
router.get("/:id", protect, getPaymentById);

// 💳 Stripe webhook endpoint
router.post("/webhook/stripe", handleStripeWebhook);

export default router;
