import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },
    unitNumber: { type: String, required: true },
    bedrooms: Number,
    bathrooms: Number,
    sqft: Number,
    rentAmount: Number,
    depositAmount: Number,
    status: {
        type: String,
        enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE"],
        default: "AVAILABLE"
    },
    images: [String],
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });

unitSchema.index({ propertyId: 1 });
unitSchema.index({ status: 1 });
unitSchema.index({ isArchived: 1 });

export default mongoose.model("Unit", unitSchema);
