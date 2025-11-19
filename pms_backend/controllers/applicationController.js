import Application from "../models/Application.js";
import Unit from "../models/Unit.js";
import Property from "../models/Property.js";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

/**
 * Tenant: Create an application for a unit (supports multiple docs)
 * Body (form-data):
 *  - unitId: string (required)
 *  - note: string (optional)
 *  - docs: files[] (optional, multiple)
 */
export const createApplication = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const { unitId, note } = req.body;

        if (!unitId) {
            return res.status(400).json({ success: false, message: "unitId is required" });
        }

        // Ensure unit exists
        const unit = await Unit.findById(unitId);
        if (!unit) {
            return res.status(404).json({ success: false, message: "Unit not found" });
        }

        // Only allow application if unit is AVAILABLE
        if (unit.status !== "AVAILABLE") {
            return res.status(400).json({
                success: false,
                message: "This unit is not available for rent",
            });
        }

        // Prevent duplicate pending application for same unit by same tenant
        const existing = await Application.findOne({ tenantId, unitId, status: "PENDING" });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending application for this unit",
            });
        }

        // Map uploaded docs (if any)
        const docs =
            req.files?.docs?.map((file) => ({
                url: `/uploads/${file.filename}`,
                type: file.mimetype || "OTHER",
            })) || [];

        const app = await Application.create({
            tenantId,
            unitId,
            note,
            docs,
        });

        return res.status(201).json({ success: true, data: app });
    } catch (err) {
        console.error("createApplication error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Tenant: List my applications
 * GET /api/applications/my
 */
export const getMyApplications = async (req, res) => {
  try {
    const tenantId = req.user._id; // ✅ safer
    const apps = await Application.find({ tenantId })
      .populate({
        path: "unitId",
        select: "unitNumber rentAmount status propertyId",
        populate: { path: "propertyId", select: "name" }
      });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Tenant: Get a single application by id (only if it's mine)
 * GET /api/applications/:id
 */
export const getMyApplicationById = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const app = await Application.findById(req.params.id).populate({
            path: "unitId",
            select: "unitNumber rentAmount status propertyId",
        });

        if (!app) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        if (app.tenantId.toString() !== tenantId) {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }

        return res.json({ success: true, data: app });
    } catch (err) {
        console.error("getMyApplicationById error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Tenant: Delete my pending application
 * DELETE /api/applications/:id
 * Only allowed if the app belongs to me AND is still PENDING.
 * (Your model enum doesn't have WITHDRAWN, so delete is the cleanest UX.)
 */
export const deleteMyPendingApplication = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const app = await Application.findById(req.params.id);

        if (!app) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        if (app.tenantId.toString() !== tenantId) {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }
        if (app.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending applications can be deleted",
            });
        }

        await app.deleteOne();
        return res.json({ success: true, message: "Application deleted" });
    } catch (err) {
        console.error("deleteMyPendingApplication error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// LANDLORD: List my applications (optional ?status=PENDING|APPROVED|REJECTED)
export const getLandlordApplications = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { status } = req.query;

    const props = await Property.find({ landlordId }, { _id: 1 });
    const propIds = props.map(p => p._id);

    const units = await Unit.find({ propertyId: { $in: propIds } }, { _id: 1, unitNumber: 1, rentAmount: 1, propertyId: 1 });
    const unitIds = units.map(u => u._id);

    const q = { unitId: { $in: unitIds } };
    if (status) q.status = status.toUpperCase();

    const apps = await Application.find(q)
      .populate({ path: "tenantId", select: "name email phone" })
      .populate({ path: "unitId", select: "unitNumber rentAmount propertyId status",
        populate: { path: "propertyId", select: "name address" }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const assertLandlordOwnsApp = async (landlordId, appId) => {
  const app = await Application.findById(appId).populate({
    path: "unitId",
    select: "propertyId",
    populate: { path: "propertyId", select: "landlordId" }
  });
  if (!app) return { error: "Application not found" };
  const owner = app.unitId?.propertyId?.landlordId?.toString();
  if (!owner || owner !== landlordId.toString()) return { error: "Not allowed" };
  return { app };
};

// LANDLORD: Approve
export const approveApplication = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { app, error } = await assertLandlordOwnsApp(landlordId, req.params.id);
    if (error) return res.status(error === "Not allowed" ? 403 : 404).json({ success: false, message: error });

    if (app.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Only PENDING applications can be approved" });
    }
    app.status = "APPROVED";
    await app.save();
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// LANDLORD: Reject
export const rejectApplication = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { app, error } = await assertLandlordOwnsApp(landlordId, req.params.id);
    if (error) return res.status(error === "Not allowed" ? 403 : 404).json({ success: false, message: error });

    if (app.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Only PENDING applications can be rejected" });
    }
    app.status = "REJECTED";
    await app.save();
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tenant: View my applications
export const getTenantApplications = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const applications = await Application.find({ tenantId })
      .populate("unitId landlordId", "unitNumber rentAmount name email propertyId")
      .populate({
        path: "unitId",
        populate: { path: "propertyId", select: "name address" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (err) {
    console.error("getTenantApplications error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Generate PDF



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateApplicationPdf = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch application with relationships
    const app = await Application.findById(id)
      .populate({
        path: "unitId",
        populate: { path: "propertyId", select: "name address rentAmount" },
      })
      .populate("tenantId", "name email");

    if (!app)
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });

    // Fetch rent directly from Unit
    const unit = await Unit.findById(app.unitId._id).select("rentAmount");
    const rent = unit?.rentAmount || 0;
    const tax = rent * 0.13; 
    const total = rent + tax;
    const paymentMethod = "Bank Transfer";

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice_${id}.pdf`
    );

    doc.pipe(res);

    /* ═══════════════ HEADER SECTION ═══════════════ */
    // Company header bar
    doc.rect(0, 0, doc.page.width, 100).fill("#3E5C52");

 try {
  const logoPath = path.join(__dirname, "../../pms_frontend/src/assets/pdflogo.png");


  const circleDiameter = 60; 
  const centerX = 70;
  const centerY = 50;

  // White circular background
  doc
    .save()
    .circle(centerX, centerY, circleDiameter / 2)
    .fill("#ffffff")
    .restore();

  // Logo inside circle 
  doc.image(
    logoPath,
    centerX - 79,
    centerY - 71,
    {
      width: 160, 
      height: 160,
    }
  );
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

    // Company name and tagline 
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

    // Invoice label
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("INVOICE", doc.page.width - 180, 35, {
        width: 130,
        align: "right",
      });

    doc.moveDown(4);

    /* ═══════════════ INVOICE METADATA ═══════════════ */
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

    // Right side - Invoice details
    const rightX = 320;
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("INVOICE DETAILS:", rightX, invoiceY);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`Invoice #: ${id.slice(-8).toUpperCase()}`, rightX, invoiceY + 15)
      .text(
        `Date: ${new Date(app.createdAt).toLocaleDateString()}`,
        rightX,
        invoiceY + 28
      )
      .text(
        `Due Date: ${new Date(
          new Date(app.createdAt).setDate(
            new Date(app.createdAt).getDate() + 30
          )
        ).toLocaleDateString()}`,
        rightX,
        invoiceY + 41
      );

    const statusColor = {
      APPROVED: "#16a34a",
      REJECTED: "#dc2626",
      PENDING: "#ca8a04",
    };
    const status = app.status || "PENDING";

    doc
      .font("Helvetica-Bold")
      .text("Status: ", rightX, invoiceY + 54, { continued: true })
      .fillColor(statusColor[status] || "#6b7280")
      .text(status);

    doc.moveDown(4);

    /* ═══════════════ BILL TO & PROPERTY INFO (SIDE BY SIDE) ═══════════════ */
    const sectionY = doc.y + 20;
    const leftColumnX = 50;
    const rightColumnX = 320;

    // Left Column - BILL TO
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("BILL TO:", leftColumnX, sectionY);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(app.tenantId?.name || "—", leftColumnX, sectionY + 15)
      .text(app.tenantId?.email || "—", leftColumnX, sectionY + 28);

    // Right Column - PROPERTY INFORMATION
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("PROPERTY INFORMATION:", rightColumnX, sectionY);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(
        app.unitId?.propertyId?.name || "—",
        rightColumnX,
        sectionY + 15
      )
      .text(
        app.unitId?.propertyId?.address || "—",
        rightColumnX,
        sectionY + 28
      )
      .text(
        `Unit: ${app.unitId?.unitNumber || "—"}`,
        rightColumnX + 10,
        sectionY + 28
      );

    doc.moveDown(7);

    /* ═══════════════ APPLICATION NOTES (if any) ═══════════════ */
    if (app.note) {
      const notesBoxY = doc.y + 10;

      // Background box
      doc.rect(50, notesBoxY, doc.page.width - 100, 50).fill("#f9fafb");

      doc
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("APPLICATION NOTE:", 60, notesBoxY + 12);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#6b7280")
        .text(app.note, 60, notesBoxY + 28, {
          width: doc.page.width - 120,
          lineBreak: true,
        });

      doc.moveDown(3);
    }

    /* ═══════════════ ITEMIZED TABLE ═══════════════ */
    const tableTop = doc.y + 20;
    const itemX = 50;
    const descX = 200;
    const amountX = doc.page.width - 150;

    // Table header
    doc.rect(50, tableTop, doc.page.width - 100, 30).fill("#3E5C52");

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("ITEM", itemX + 10, tableTop + 10)
      .text("DESCRIPTION", descX, tableTop + 10)
      .text("AMOUNT", amountX, tableTop + 10, { align: "right", width: 100 });

    // Table rows
    let currentY = tableTop + 40;
    const rowHeight = 35;

    const items = [
      { item: "01", desc: "Monthly Rent", amount: rent },
      { item: "02", desc: "HST (13%)", amount: tax },
    ];

    doc.fillColor("#6b7280").font("Helvetica").fontSize(10);

    items.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
      doc.rect(50, currentY, doc.page.width - 100, rowHeight).fill(bgColor);

      doc
        .fillColor("#374151")
        .text(row.item, itemX + 10, currentY + 12)
        .text(row.desc, descX, currentY + 12)
        .text(`$${row.amount.toFixed(2)}`, amountX, currentY + 12, {
          align: "right",
          width: 100,
        });

      currentY += rowHeight;
    });

    /* ═══════════════ TOTALS SECTION ═══════════════ */
    currentY += 10;
    const totalsX = doc.page.width - 250;

    // Subtotal
    doc
      .fillColor("#6b7280")
      .font("Helvetica")
      .fontSize(10)
      .text("Subtotal:", totalsX, currentY)
      .text(`$${rent.toFixed(2)}`, amountX, currentY, {
        align: "right",
        width: 100,
      });

    currentY += 20;

    // Tax
    doc
      .text("Tax (HST):", totalsX, currentY)
      .text(`$${tax.toFixed(2)}`, amountX, currentY, {
        align: "right",
        width: 100,
      });

    currentY += 25;

    // Total bar
    doc.rect(totalsX - 10, currentY - 5, 260, 30).fill("#3E5C52");

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("TOTAL DUE:", totalsX, currentY + 5)
      .text(`$${total.toFixed(2)}`, amountX, currentY + 5, {
        align: "right",
        width: 100,
      });

    /* ═══════════════ PAYMENT METHOD ═══════════════ */
    doc.moveDown(3);
    const paymentY = doc.y + 10;

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("PAYMENT METHOD:", 50, paymentY);

    doc
      .fillColor("#6b7280")
      .font("Helvetica")
      .fontSize(10)
      .text(paymentMethod, 50, paymentY + 15);

    /* ═══════════════ FOOTER ═══════════════ */
    const footerY = doc.page.height - 80;

    doc
      .moveTo(50, footerY)
      .lineTo(doc.page.width - 50, footerY)
      .stroke("#d1d5db");

    doc
      .fillColor("#9ca3af")
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Thank you for your business! Payment is due within 30 days.",
        50,
        footerY + 15,
        { align: "center", width: doc.page.width - 100 }
      )
      .text(
        `© ${new Date().getFullYear()} Vasudha Inc. • www.vasudha.ca • All rights reserved`,
        50,
        footerY + 35,
        { align: "center", width: doc.page.width - 100 }
      );

    doc.end();
  } catch (error) {
    console.error("generateApplicationPdf error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate PDF" });
  }
};