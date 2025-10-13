import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lease",
        required: true
    },
    period: {
        year: Number,
        month: { type: Number, min: 1, max: 12 }
    },
    dueDate: Date,
    lineItems: [{ label: String, amount: Number }],
    amountDue: Number,
    amountPaid: { type: Number, default: 0 },
    balance: Number,
    status: {
        type: String,
        enum: ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"],
        default: "DRAFT"
    },
    stripeInvoiceId: String,
    stripeCustomerId: String
}, { timestamps: true });

invoiceSchema.index(
    { leaseId: 1, "period.year": 1, "period.month": 1 },
    { unique: true }
);
invoiceSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model("Invoice", invoiceSchema);

