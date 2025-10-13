import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["LANDLORD", "TENANT", "MAINTENANCE"],
        required: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    passwordHash: { type: String, required: true },
    profile: {
        companyName: String,
        avatarUrl: String,
        address: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
