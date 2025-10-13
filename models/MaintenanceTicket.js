import mongoose from "mongoose";

const maintenanceTicketSchema = new mongoose.Schema({
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: String,
    category: {
        type: String,
        enum: ["PLUMBING", "ELECTRICAL", "HVAC", "APPLIANCE", "GENERAL"],
        default: "GENERAL"
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        default: "MEDIUM"
    },
    status: {
        type: String,
        enum: ["OPEN", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED"],
        default: "OPEN"
    },
    attachments: [String],
    timeline: [{
        at: Date,
        action: String,
        byUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: String
    }],
    requestedAt: { type: Date, default: Date.now },
    acknowledgedAt: Date,
    resolvedAt: Date
}, { timestamps: true });

maintenanceTicketSchema.index({ status: 1, priority: 1 });
maintenanceTicketSchema.index({ assignedTo: 1 });
maintenanceTicketSchema.index({ unitId: 1 });

export default mongoose.model("MaintenanceTicket", maintenanceTicketSchema);
