import Invoice from "../models/Invoice.js";
import Lease from "../models/Lease.js";
import Payment from "../models/Payment.js";

/* ======================================================
   CREATE INVOICE (Auto or Manual)
====================================================== */
export const createInvoice = async (req, res) => {
    try {
        const { leaseId, dueDate, lineItems } = req.body;

        // Basic validation
        if (!leaseId)
            return res.status(400).json({ success: false, message: "leaseId is required" });

        const lease = await Lease.findById(leaseId)
            .populate("tenantId landlordId", "name email");

        if (!lease)
            return res.status(404).json({ success: false, message: "Lease not found" });

        if (lease.status !== "ACTIVE")
            return res.status(400).json({ success: false, message: "Invoice can only be created for ACTIVE leases" });

        // Default line item if none provided
        const items = lineItems?.length
            ? lineItems
            : [{ label: "Monthly Rent", amount: lease.rentAmount }];

        const amountDue = items.reduce((sum, i) => sum + (i.amount || 0), 0);

        // Set invoice period (YYYY, MM)
        const now = new Date();
        const invoice = await Invoice.create({
            leaseId,
            period: { year: now.getFullYear(), month: now.getMonth() + 1 },
            dueDate: dueDate ? new Date(dueDate) : new Date(),
            lineItems: items,
            amountDue,
            balance: amountDue,
            status: "ISSUED",
        });

        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: invoice,
        });
    } catch (error) {
        console.error("createInvoice error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   TENANT: GET MY INVOICES
====================================================== */
export const getMyInvoices = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const leases = await Lease.find({ tenantId }).select("_id");
        const leaseIds = leases.map((l) => l._id);

        const invoices = await Invoice.find({ leaseId: { $in: leaseIds } })
            .populate("leaseId", "startDate endDate rentAmount")
            .sort({ dueDate: -1 });

        res.json({ success: true, data: invoices });
    } catch (error) {
        console.error("getMyInvoices error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   LANDLORD: VIEW ALL INVOICES UNDER OWNED LEASES
====================================================== */
export const getLandlordInvoices = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const leases = await Lease.find({ landlordId }).select("_id tenantId");
        const leaseIds = leases.map((l) => l._id);

        const invoices = await Invoice.find({ leaseId: { $in: leaseIds } })
            .populate({
                path: "leaseId",
                populate: { path: "tenantId", select: "name email" },
            })
            .sort({ dueDate: -1 });

        res.json({ success: true, data: invoices });
    } catch (error) {
        console.error("getLandlordInvoices error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   GET SINGLE INVOICE BY ID (tenant or landlord)
====================================================== */
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate({
                path: "leaseId",
                populate: [
                    { path: "tenantId", select: "name email" },
                    { path: "landlordId", select: "name email" },
                ],
            });

        if (!invoice)
            return res.status(404).json({ success: false, message: "Invoice not found" });

        // Attach related payments
        const payments = await Payment.find({ invoiceId: invoice._id }).select(
            "amount status method paidAt"
        );

        res.json({ success: true, data: { invoice, payments } });
    } catch (error) {
        console.error("getInvoiceById error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   UPDATE INVOICE STATUS (Admin or Automated)
====================================================== */
export const updateInvoiceStatus = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice)
            return res.status(404).json({ success: false, message: "Invoice not found" });

        const payments = await Payment.find({ invoiceId: invoice._id, status: "SUCCEEDED" });
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        invoice.amountPaid = totalPaid;
        invoice.balance = Math.max(invoice.amountDue - totalPaid, 0);

        if (invoice.balance <= 0) {
            invoice.status = "PAID";
        } else if (invoice.balance > 0 && totalPaid > 0) {
            invoice.status = "PARTIALLY_PAID";
        } else if (new Date(invoice.dueDate) < new Date()) {
            invoice.status = "OVERDUE";
        } else {
            invoice.status = "ISSUED";
        }

        await invoice.save();
        res.json({ success: true, message: "Invoice status updated", data: invoice });
    } catch (error) {
        console.error("updateInvoiceStatus error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ======================================================
   AUTO-GENERATE NEXT MONTH’S INVOICE (scheduler hook)
====================================================== */
export const generateNextMonthInvoice = async (req, res) => {
    try {
        const { leaseId } = req.body;
        const lease = await Lease.findById(leaseId);
        if (!lease || lease.status !== "ACTIVE")
            return res.status(404).json({ success: false, message: "Active lease not found" });

        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const existing = await Invoice.findOne({
            leaseId,
            "period.year": nextMonth.getFullYear(),
            "period.month": nextMonth.getMonth() + 1,
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Next month's invoice already exists" });
        }

        const invoice = await Invoice.create({
            leaseId,
            period: { year: nextMonth.getFullYear(), month: nextMonth.getMonth() + 1 },
            dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), lease.dueDay || 1),
            lineItems: [{ label: "Monthly Rent", amount: lease.rentAmount }],
            amountDue: lease.rentAmount,
            balance: lease.rentAmount,
            status: "ISSUED",
        });

        res.status(201).json({ success: true, message: "Next month's invoice generated", data: invoice });
    } catch (error) {
        console.error("generateNextMonthInvoice error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
