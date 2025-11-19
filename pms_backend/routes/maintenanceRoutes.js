import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
    createMaintenanceTicket,
    getMyTickets,
    getLandlordTickets,
    assignTicket,
    updateTicketStatus,
    closeTicket,
    getTicketById
} from "../controllers/maintenanceController.js";

const router = Router();

// TENANT: Create a ticket
router.post("/", protect, authorizeRoles("TENANT"), upload.array("attachments", 5), createMaintenanceTicket);

//TENANT: View my tickets
router.get("/my", protect, authorizeRoles("TENANT"), getMyTickets);

// LANDLORD: View all tickets
router.get("/landlord", protect, authorizeRoles("LANDLORD"), getLandlordTickets);

//LANDLORD: Assign ticket
router.put("/:id/assign", protect, authorizeRoles("LANDLORD"), assignTicket);

// MAINTENANCE STAFF: Update status
router.put("/:id/status", protect, authorizeRoles("MAINTENANCE"), updateTicketStatus);

// LANDLORD: Close resolved ticket
router.put("/:id/close", protect, authorizeRoles("LANDLORD"), closeTicket);

// UNIVERSAL: View single ticket
router.get("/:id", protect, getTicketById);

export default router;
