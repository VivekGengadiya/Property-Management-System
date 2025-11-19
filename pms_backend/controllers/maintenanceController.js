import MaintenanceTicket from "../models/MaintenanceTicket.js";
import Lease from "../models/Lease.js";
import Property from "../models/Property.js";
import Unit from "../models/Unit.js";

/* ======================================================
   TENANT: Create Maintenance Ticket
====================================================== */
export const createMaintenanceTicket = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const { unitId, title, description, category, priority } = req.body;

        const errors = [];
        if (!unitId) errors.push({ path: "unitId", msg: "Unit ID is required" });
        if (!title?.trim()) errors.push({ path: "title", msg: "Title is required" });
        if (!description?.trim()) errors.push({ path: "description", msg: "Description is required" });

        if (errors.length)
            return res.status(400).json({ success: false, message: "Validation failed", errors });

        // Verify tenant has an active lease for that unit
        const lease = await Lease.findOne({
            tenantId,
            unitId,
            status: "ACTIVE",
        });
        if (!lease) {
            return res.status(403).json({
                success: false,
                message: "You can only create tickets for units you currently lease.",
            });
        }

        // Limit open tickets per unit
        const openCount = await MaintenanceTicket.countDocuments({
            unitId,
            status: { $in: ["OPEN", "IN_PROGRESS", "ON_HOLD"] },
        });
        if (openCount >= 5) {
            return res.status(400).json({
                success: false,
                message: "Too many open tickets for this unit. Please wait until others are resolved.",
            });
        }

        // Handle file uploads
        const attachments = req.files?.map((f) => f.path || `/uploads/${f.filename}`) || [];

        const ticket = await MaintenanceTicket.create({
            unitId,
            createdBy: tenantId,
            title,
            description,
            category: category?.toUpperCase() || "GENERAL",
            priority: priority?.toUpperCase() || "MEDIUM",
            attachments,
            timeline: [
                {
                    at: new Date(),
                    action: "CREATED",
                    byUserId: tenantId,
                    note: "Ticket submitted by tenant",
                },
            ],
        });

        res.status(201).json({ success: true, message: "Maintenance ticket created", data: ticket });
    } catch (error) {
        console.error("createMaintenanceTicket error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   TENANT: Get My Tickets
====================================================== */
export const getMyTickets = async (req, res) => {
    try {
        const tenantId = req.user.id;

        // Find all units the tenant is currently leasing
        const activeLeases = await Lease.find({ tenantId, status: "ACTIVE" }).select("unitId");
        const unitIds = activeLeases.map((l) => l.unitId);

        const tickets = await MaintenanceTicket.find({ unitId: { $in: unitIds } })
            .populate("unitId", "unitNumber")
            .populate("assignedTo", "name role")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: tickets });
    } catch (error) {
        console.error("getMyTickets error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   LANDLORD: View All Tickets Under Owned Properties
====================================================== */
export const getLandlordTickets = async (req, res) => {
    try {
        const landlordId = req.user.id;

        // Find properties and units owned by landlord
        const properties = await Property.find({ landlordId }).select("_id");
        const propertyIds = properties.map((p) => p._id);
        const units = await Unit.find({ propertyId: { $in: propertyIds } }).select("_id");
        const unitIds = units.map((u) => u._id);

        const tickets = await MaintenanceTicket.find({ unitId: { $in: unitIds } })
            .populate("unitId", "unitNumber")
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name role")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: tickets });
    } catch (error) {
        console.error("getLandlordTickets error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   LANDLORD: Assign a Ticket to Maintenance Staff
====================================================== */
export const assignTicket = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { assignedTo } = req.body;
        const ticket = await MaintenanceTicket.findById(req.params.id)
            .populate({
                path: "unitId",
                populate: { path: "propertyId", select: "landlordId" },
            });

        if (!ticket)
            return res.status(404).json({ success: false, message: "Ticket not found" });

        if (ticket.unitId.propertyId.landlordId.toString() !== landlordId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized for this ticket" });
        }

        ticket.assignedTo = assignedTo;
        ticket.status = "IN_PROGRESS";
        ticket.timeline.push({
            at: new Date(),
            action: "ASSIGNED",
            byUserId: landlordId,
            note: `Assigned to maintenance user ${assignedTo}`,
        });

        await ticket.save();
        res.json({ success: true, message: "Ticket assigned successfully", data: ticket });
    } catch (error) {
        console.error("assignTicket error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   MAINTENANCE STAFF: Update Ticket Status / Timeline
====================================================== */
export const updateTicketStatus = async (req, res) => {
    try {
        const staffId = req.user.id;
        const { status, note } = req.body;
        const ticket = await MaintenanceTicket.findById(req.params.id);

        if (!ticket)
            return res.status(404).json({ success: false, message: "Ticket not found" });

        if (ticket.assignedTo?.toString() !== staffId.toString()) {
            return res.status(403).json({ success: false, message: "Not assigned to you" });
        }

        const allowedStatuses = ["IN_PROGRESS", "ON_HOLD", "RESOLVED"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
            });
        }

        ticket.status = status;
        ticket.timeline.push({
            at: new Date(),
            action: `STATUS_${status}`,
            byUserId: staffId,
            note: note || "",
        });

        if (status === "RESOLVED") ticket.resolvedAt = new Date();

        await ticket.save();
        res.json({ success: true, message: "Status updated", data: ticket });
    } catch (error) {
        console.error("updateTicketStatus error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   LANDLORD: Close Resolved Ticket
====================================================== */
export const closeTicket = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const ticket = await MaintenanceTicket.findById(req.params.id)
            .populate({
                path: "unitId",
                populate: { path: "propertyId", select: "landlordId" },
            });

        if (!ticket)
            return res.status(404).json({ success: false, message: "Ticket not found" });
        if (ticket.unitId.propertyId.landlordId.toString() !== landlordId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }
        if (ticket.status !== "RESOLVED") {
            return res.status(400).json({ success: false, message: "Ticket must be resolved before closing" });
        }

        ticket.status = "CLOSED";
        ticket.timeline.push({
            at: new Date(),
            action: "CLOSED",
            byUserId: landlordId,
            note: "Ticket closed by landlord",
        });
        await ticket.save();

        res.json({ success: true, message: "Ticket closed successfully", data: ticket });
    } catch (error) {
        console.error("closeTicket error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   UNIVERSAL: Get Ticket by ID (with timeline)
====================================================== */
export const getTicketById = async (req, res) => {
    try {
        const ticket = await MaintenanceTicket.findById(req.params.id)
            .populate("unitId", "unitNumber")
            .populate("createdBy", "name role email")
            .populate("assignedTo", "name role email")
            .populate("timeline.byUserId", "name role");

        if (!ticket)
            return res.status(404).json({ success: false, message: "Ticket not found" });

        res.json({ success: true, data: ticket });
    } catch (error) {
        console.error("getTicketById error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
