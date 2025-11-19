import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    },
    note: String,

    docs: [
        {
            url: { type: String, required: true },
            type: { type: String, default: "OTHER" }
        }
    ]
}, { timestamps: true });

applicationSchema.index({ unitId: 1 });
applicationSchema.index({ tenantId: 1 });
applicationSchema.index({ status: 1 });

export default mongoose.model("Application", applicationSchema);
