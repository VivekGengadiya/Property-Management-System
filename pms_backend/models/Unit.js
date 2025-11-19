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


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmVjZGYyOTFiNDM4NDVhMDFjYzBhNyIsInJvbGUiOiJMQU5ETE9SRCIsImlhdCI6MTc2MTUyOTM0OSwiZXhwIjoxNzYxNTMyOTQ5fQ.HH3q08E8R6k4g-U0CnQqAUtjge8hlqkFnifazzGG8WI
// 68fecdf291b43845a01cc0a7