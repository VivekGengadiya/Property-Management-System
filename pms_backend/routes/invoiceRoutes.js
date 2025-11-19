import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    createInvoice,
    getMyInvoices,
    getLandlordInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    generateNextMonthInvoice
} from "../controllers/invoiceController.js";

const router = Router();

// Create manual invoice
router.post("/", protect, authorizeRoles("LANDLORD"), createInvoice);

// Tenant: view own invoices
router.get("/my", protect, authorizeRoles("TENANT"), getMyInvoices);

// Landlord: view invoices across leases
router.get("/landlord", protect, authorizeRoles("LANDLORD"), getLandlordInvoices);

// Generate next month’s invoice
router.post("/generate", protect, authorizeRoles("LANDLORD"), generateNextMonthInvoice);

// Single invoice with payments
router.get("/:id", protect, getInvoiceById);

// Update invoice status (system or admin)
router.put("/:id/status", protect, updateInvoiceStatus);

export default router;
