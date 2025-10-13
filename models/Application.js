import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: true
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"],
        default: "SUBMITTED"
    },
    docs: [{ type: { type: String }, url: String }],
    notes: String
}, { timestamps: true });

applicationSchema.index({ unitId: 1 });
applicationSchema.index({ applicantId: 1 });
applicationSchema.index({ status: 1 });

export default mongoose.model("Application", applicationSchema);
