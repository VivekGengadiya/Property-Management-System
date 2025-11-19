import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema({
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: true
    },
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startDate: Date,
    endDate: Date,
    rentAmount: Number,
    dueDay: { type: Number, min: 1, max: 28 },
    depositAmount: Number,
    status: {
        type: String,
        enum: ["ACTIVE", "PENDING", "TERMINATED", "EXPIRED", "REJECTED"],
        default: "PENDING"
    },
    documents: [{ name: String, url: String }],
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });

leaseSchema.index({ unitId: 1 });
leaseSchema.index({ tenantId: 1 });
leaseSchema.index({ status: 1 });
leaseSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Lease", leaseSchema);

