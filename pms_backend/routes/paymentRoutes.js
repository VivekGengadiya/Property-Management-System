import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    createPayment,
    createPayPalPayment,
    getMyPayments,
    getLandlordPayments,
    getPaymentById,
    handleStripeWebhook
} from "../controllers/paymentController.js";

const router = Router();

// 💳 Tenant creates payment (supports multiple methods)
router.post("/", protect, authorizeRoles("TENANT"), createPayment);

// 💰 Tenant creates PayPal payment
router.post("/paypal", protect, authorizeRoles("TENANT"), createPayPalPayment);

// 👤 Tenant views all payments
router.get("/my", protect, authorizeRoles("TENANT"), getMyPayments);

// 🏠 Landlord views all payments for their properties
router.get("/landlord", protect, authorizeRoles("LANDLORD"), getLandlordPayments);

// 🔍 Get single payment
router.get("/:id", protect, getPaymentById);


export default router;