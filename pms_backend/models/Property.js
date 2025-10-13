import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: { type: String, required: true },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    amenities: [String], // Example: ["Parking", "Gym"]
    notes: String,
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for better query performance
propertySchema.index({ landlordId: 1 });
propertySchema.index({ "address.city": 1 });
propertySchema.index({ isArchived: 1 });

export default mongoose.model("Property", propertySchema);
