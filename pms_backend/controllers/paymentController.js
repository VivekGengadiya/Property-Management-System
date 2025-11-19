import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Lease from "../models/Lease.js";
import mongoose from "mongoose";

/* ======================================================
   💳 TENANT: Create Payment (manual or Stripe)
====================================================== */
export const createPayment = async (req, res) => {
    try {
        const payerId = req.user.id;
        const { invoiceId, method, stripePaymentIntentId } = req.body;

        //  Basic validation
        if (!invoiceId || !method) {
            return res.status(400).json({
                success: false,
                message: "invoiceId and payment method are required",
            });
        }

        //  Check if invoice exists
        const invoice = await Invoice.findById(invoiceId)
            .populate({
                path: "leaseId",
                populate: { path: "tenantId", select: "name email" },
            })
            .populate("tenantId landlordId", "name email");

        if (!invoice)
            return res.status(404).json({ success: false, message: "Invoice not found" });

        //  Check that payer is the tenant for that invoice
        if (invoice.tenantId._id.toString() !== payerId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to pay this invoice" });
        }

        //  Check if already paid
        if (invoice.status === "PAID") {
            return res.status(400).json({ success: false, message: "This invoice is already paid" });
        }

        //  Calculate payment amount
        const amount = invoice.amountDue;
        //  Create Payment record
        const payment = await Payment.create({
            invoiceId,
            payerId,
            amount,
            method,
            stripePaymentIntentId,
            status: method === "MANUAL_CASH" || method === "MANUAL_ETRANSFER" ? "SUCCEEDED" : "PENDING",
            paidAt: method !== "STRIPE" ? new Date() : null,
        });

        //  Auto-update invoice if manual payment succeeds
        if (payment.status === "SUCCEEDED") {
            invoice.status = "PAID";
            invoice.paidAt = new Date();
            await invoice.save();
        }

        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: payment,
        });
    } catch (error) {
        console.error("createPayment error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   STRIPE WEBHOOK (Optional)
====================================================== */
export const handleStripeWebhook = async (req, res) => {
    try {
        const event = req.body;

        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });

            if (payment) {
                payment.status = "SUCCEEDED";
                payment.paidAt = new Date();
                await payment.save();

                //  Update invoice as paid
                const invoice = await Invoice.findById(payment.invoiceId);
                if (invoice) {
                    invoice.status = "PAID";
                    invoice.paidAt = new Date();
                    await invoice.save();
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error("Stripe webhook error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

/* ======================================================
  TENANT: View My Payments
====================================================== */
export const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ payerId: req.user.id })
            .populate({
                path: "invoiceId",
                populate: { path: "leaseId", select: "unitId startDate endDate" },
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: payments });
    } catch (error) {
        console.error("getMyPayments error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
 LANDLORD: View All Payments (for owned properties)
====================================================== */
export const getLandlordPayments = async (req, res) => {
    try {
        const landlordId = req.user.id;

        const invoices = await Invoice.find({ landlordId }).select("_id");
        const invoiceIds = invoices.map((inv) => inv._id);

        const payments = await Payment.find({ invoiceId: { $in: invoiceIds } })
            .populate("payerId", "name email")
            .populate("invoiceId", "amountDue status dueDate")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: payments });
    } catch (error) {
        console.error("getLandlordPayments error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
 UNIVERSAL: Get Payment by ID
====================================================== */
export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate("invoiceId", "amountDue status dueDate")
            .populate("payerId", "name email role");

        if (!payment)
            return res.status(404).json({ success: false, message: "Payment not found" });

        res.json({ success: true, data: payment });
    } catch (error) {
        console.error("getPaymentById error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
