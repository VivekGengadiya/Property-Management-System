import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    createInvoice,
    getMyInvoices,
    getLandlordInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    generateNextMonthInvoice,
    getInvoiceByLease,
    generateInvoicePdf
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
// Get invoice for specific lease (Tenant or Landlord)
router.get("/lease/:leaseId", protect, getInvoiceByLease);

// Single invoice with payments
router.get("/:id", protect, getInvoiceById);

// Update invoice status (system or admin)
router.put("/:id/status", protect, updateInvoiceStatus);

router.get("/:id/pdf", protect, generateInvoicePdf);


export default router;
