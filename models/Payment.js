import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        required: true
    },
    payerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: { type: Number, required: true, min: 0 },
    method: {
        type: String,
        enum: ["STRIPE", "MANUAL_CASH", "MANUAL_ETRANSFER"],
        required: true
    },
    stripePaymentIntentId: String,
    status: {
        type: String,
        enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"],
        default: "PENDING"
    },
    paidAt: Date
}, { timestamps: true });

paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ payerId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model("Payment", paymentSchema);
