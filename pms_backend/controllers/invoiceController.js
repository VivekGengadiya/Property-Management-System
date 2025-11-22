import Invoice from "../models/Invoice.js";
import Lease from "../models/Lease.js";
import Payment from "../models/Payment.js";

import { fileURLToPath } from "url";
import path from "path";
import PDFDocument from "pdfkit";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch invoice
    const invoice = await Invoice.findById(id)
      .populate({
        path: "leaseId",
        populate: [
          { path: "tenantId", select: "name email" },
          { path: "landlordId", select: "name email" },
          {
            path: "unitId",
            populate: { path: "propertyId", select: "name address" }
          }
        ],
      });

    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    // Fetch related payments
    const payments = await Payment.find({
      invoiceId: invoice._id,
      status: "SUCCEEDED",
    }).sort({ paidAt: -1 });

    const lease = invoice.leaseId;
    const property = lease.unitId.propertyId;
    const unit = lease.unitId;

    const tenant = lease.tenantId;
    const landlord = lease.landlordId;

    const amountDue = invoice.amountDue || 0;
    const amountPaid = invoice.amountPaid || 0;
    const balance = invoice.balance || 0;

    const statusColor = {
      PAID: "#16a34a",
      PARTIALLY_PAID: "#ca8a04",
      PENDING: "#6b7280",
      ISSUED: "#60a5fa",
      OVERDUE: "#dc2626",
    };

    const formatDate = (d) =>
      d
        ? new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—";

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice_${id.slice(-8).toUpperCase()}.pdf`
    );

    doc.pipe(res);

    /* ═══════════════ HEADER ═══════════════ */
    doc.rect(0, 0, doc.page.width, 100).fill("#3E5C52");

    try {
      const logoPath = path.join(
        __dirname,
        "../../pms_frontend/src/assets/pdflogo.png"
      );

      const circleDiameter = 60;
      const centerX = 70;
      const centerY = 50;

      doc
        .save()
        .circle(centerX, centerY, circleDiameter / 2)
        .fill("#ffffff")
        .restore();

      doc.image(logoPath, centerX - 79, centerY - 71, {
        width: 160,
        height: 160,
      });
    } catch (err) {
      const centerX = 70;
      const centerY = 50;
      doc
        .circle(centerX, centerY, 40)
        .fillAndStroke("#ffffff", "#e2e8f0")
        .fillColor("#3E5C52")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("V", centerX - 12, centerY - 10);
    }

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(28)
      .text("Vasudha", 115, 30);

    doc
      .fillColor("#e2e8f0")
      .fontSize(11)
      .font("Helvetica")
      .text("Property Management Solutions", 115, 62);

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("INVOICE", doc.page.width - 180, 35, {
        width: 160,
        align: "right",
      });

    doc.moveDown(4);

    /* ═══════════════ INVOICE META ═══════════════ */
 const invoiceY = 120;

    // Left side - Company info
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("FROM:", 50, invoiceY);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text("Vasudha Property Management", 50, invoiceY + 15)
      .text("123 Main Street, Suite 100", 50, invoiceY + 28)
      .text("Toronto, ON M5V 3A8", 50, invoiceY + 41)
      .text("info@vasudha.ca", 50, invoiceY + 54)
      .text("+1 (111) 123-4567", 50, invoiceY + 67);


    const metaY = 220;
    const rightX = 320;

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("INVOICE DETAILS:", rightX, metaY);

    doc
      .fillColor("#6b7280")
      .font("Helvetica")
      .fontSize(10)
      .text(
        `Invoice #: ${invoice._id.toString().slice(-8).toUpperCase()}`,
        rightX,
        metaY + 15
      )
      .text(`Date: ${formatDate(invoice.createdAt)}`, rightX, metaY + 30)
      .text(`Due Date: ${formatDate(invoice.dueDate)}`, rightX, metaY + 45);

    doc
      .font("Helvetica-Bold")
      .text("Status: ", rightX, metaY + 60, { continued: true })
      .fillColor(statusColor[invoice.status] || "#6b7280")
      .text(invoice.status);

    /* ═══════════════ BILL TO ═══════════════ */
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .text("BILL TO:", 50, metaY);

    doc
      .font("Helvetica")
      .fillColor("#6b7280")
      .text(tenant.name, 50, metaY + 15)
      .text(tenant.email, 50, metaY + 30);

    /* ═══════════════ PROPERTY INFO ═══════════════ */
    doc.moveDown(5);

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("PROPERTY INFORMATION", 50, doc.y);

    doc
      .moveDown(0.5)
      .font("Helvetica")
      .fillColor("#6b7280")
      .fontSize(10)
      .text(property.name || "—")
      .text(property.address || "—")
      .text(`Unit: ${unit.unitNumber}`, 50, doc.y);

    /* ═══════════════ TABLE HEADER ═══════════════ */
    const tableTop = doc.y + 30;

    doc.rect(50, tableTop, doc.page.width - 100, 30).fill("#3E5C52");

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("DESCRIPTION", 60, tableTop + 10)
      .text("AMOUNT", doc.page.width - 150, tableTop + 10, {
        width: 100,
        align: "right",
      });

    /* ═══════════════ TABLE CONTENT ═══════════════ */
    let rowY = tableTop + 40;

    invoice.lineItems.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? "#ffffff" : "#f9fafb";

      doc.rect(50, rowY, doc.page.width - 100, 30).fill(bg);

      doc
        .fillColor("#374151")
        .fontSize(10)
        .text(item.label, 60, rowY + 10);

      doc.text(`$${item.amount.toFixed(2)}`, doc.page.width - 150, rowY + 10, {
        width: 100,
        align: "right",
      });

      rowY += 30;
    });

    /* ═══════════════ TOTALS SECTION (UPDATED) ═══════════════ */

    rowY += 10;
    const totalsX = doc.page.width - 250;

    // Build subtotal breakdown text
    const subtotalDetails = invoice.lineItems
      .map((item) => item.label)
      .join(", ");

    const writeTotalRow = (label, value) => {
      doc
        .fillColor("#6b7280")
        .fontSize(10)
        .text(label, totalsX, rowY);

      doc.text(`$${value.toFixed(2)}`, doc.page.width - 150, rowY, {
        width: 100,
        align: "right",
      });

      rowY += 20;
    };

    // Subtotal WITH description
    writeTotalRow(`Paid ${subtotalDetails}:`, amountDue);



    doc
      .rect(totalsX - 10, rowY - 5, 260, 30)
      .fill("#3E5C52");

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("BALANCE DUE:", totalsX, rowY + 5)
      .text(`$${balance.toFixed(2)}`, doc.page.width - 150, rowY + 5, {
        width: 100,
        align: "right",
      });

    /* ═══════════════ PAYMENT HISTORY ═══════════════ */
    doc.moveDown(2);

    if (payments.length > 0) {
      doc
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("PAYMENT HISTORY");

      payments.forEach((p) => {
        doc
          .fillColor("#6b7280")
          .fontSize(10)
          .text(
            `${formatDate(p.paidAt)} — $${p.amount.toFixed(
              2
            )} via ${p.method.replace("_", " ")}`
          );
      });
    }

    /* ═══════════════ FOOTER ═══════════════ */
    const footerY = doc.page.height - 60;

    doc
      .moveTo(50, footerY)
      .lineTo(doc.page.width - 50, footerY)
      .stroke("#d1d5db");

    doc
      .fillColor("#9ca3af")
      .font("Helvetica")
      .fontSize(9)
      .text(
        "This invoice is issued by the landlord and managed through the Vasudha system.",
        50,
        footerY + 15,
        { align: "center", width: doc.page.width - 100 }
      )
      .text(
        `© ${new Date().getFullYear()} Vasudha Inc. • www.vasudha.ca • All rights reserved`,
        50,
        footerY + 30,
        { align: "center", width: doc.page.width - 100 }
      );

    doc.end();
  } catch (error) {
    console.error("generateInvoicePdf error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate Invoice PDF",
    });
  }
};

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
   GET INVOICE BY LEASE ID
====================================================== */
export const getInvoiceByLease = async (req, res) => {
    try {
        const { leaseId } = req.params;

        const invoice = await Invoice.findOne({ leaseId })
            .sort({ createdAt: -1 }) // latest invoice
            .populate({
                path: "leaseId",
                select: "rentAmount startDate endDate tenantId landlordId",
            });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "No invoice found for this lease",
            });
        }

        // Attach related payments
        const payments = await Payment.find({ invoiceId: invoice._id })
            .select("amount status method paidAt");

        res.json({
            success: true,
            data: { invoice, payments },
        });
    } catch (error) {
        console.error("getInvoiceByLease error:", error);
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
