import Lease from "../models/Lease.js";
import Unit from "../models/Unit.js";
import Application from "../models/Application.js";
import Property from "../models/Property.js";
import { fileURLToPath } from "url";
import path from "path";
import PDFDocument from "pdfkit";

/* -------------------------------------------------
Create lease after approving application
--------------------------------------------------- */
export const createLease = async (req, res) => {
    try {
        const {
  applicationId,
  startDate,
  endDate,
  dueDay,

  leaseTitle,
  leaseType,
  rentFrequency,
  paymentMethod,
  lateFeeType,
  lateFeeValue,
  discountNotes,

  petsAllowed,
  smokingAllowed,
  parkingIncluded,
  utilitiesIncluded,
  furnished,

  emergencyContactName,
  emergencyContactPhone,
  additionalTerms,
} = req.body;

        const landlordId = req.user.id;

        if (!applicationId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "applicationId, startDate, and endDate are required",
            });
        }

        //Fetch full application
        const application = await Application.findById(applicationId)
            .populate({
                path: "unitId",
                populate: { path: "propertyId", select: "name landlordId" },
            })
            .populate("tenantId", "name email phone");

        if (!application)
            return res.status(404).json({ success: false, message: "Application not found" });

        if (application.unitId.propertyId.landlordId.toString() !== landlordId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // Ensure unit exists and no active lease
        const unit = await Unit.findById(application.unitId._id);
        if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

        const existing = await Lease.findOne({
            unitId: unit._id,
            status: { $in: ["ACTIVE", "PENDING"] },
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "A lease already exists for this unit",
            });
        }

        // Handle uploaded docs
        const documents =
            req.files?.docs?.map((file) => ({
                name: file.originalname,
                url: file.path || file.url || `/uploads/${file.filename}`,
            })) || [];

        // Default deposit = rent
        const rentAmount = unit.rentAmount || 0;
        const depositAmount = rentAmount;

        // Create lease
        const lease = await Lease.create({
  unitId: unit._id,
  propertyId: application.unitId.propertyId._id,
  landlordId,
  tenantId: application.tenantId._id,

  // BASIC
  leaseTitle,
  leaseType,
  startDate,
  endDate,

  // MONEY
  rentAmount,
  rentFrequency: rentFrequency || "MONTHLY",
  dueDay: dueDay || 1,
  depositAmount,

  // PAYMENT & LATE FEE
  paymentMethod: paymentMethod || "E_TRANSFER",
  lateFeeType: lateFeeType || "NONE",
  lateFeeValue: lateFeeValue || 0,
  discountNotes,

  // RULES
  petsAllowed,
  smokingAllowed,
  parkingIncluded,
  utilitiesIncluded,
  furnished,

  // EXTRA
  emergencyContactName,
  emergencyContactPhone,
  additionalTerms,

  documents,
  status: "PENDING",
});

        //  Update application status
        application.status = "APPROVED";
        await application.save();

        res.status(201).json({
            success: true,
            message: "Lease created and pending tenant confirmation",
            data: lease,
        });
    } catch (error) {
        console.error("createLease error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* -------------------------------------------------
   TENANT: View my leases
--------------------------------------------------- */
export const getMyLeases = async (req, res) => {
    try {
        const leases = await Lease.find({ tenantId: req.user.id })
            .populate({
                path: "unitId",
                select: "unitNumber rentAmount status propertyId",
                populate: { path: "propertyId", select: "name address" },
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: leases });
    } catch (error) {
        console.error("getMyLeases error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* -------------------------------------------------
LANDLORD: View all leases they own
--------------------------------------------------- */
export const getLandlordLeases = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const leases = await Lease.find({ landlordId })
            .populate("tenantId", "name email phone")
            .populate({
                path: "unitId",
                select: "unitNumber rentAmount status propertyId",
                populate: { path: "propertyId", select: "name address" },
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: leases });
    } catch (error) {
        console.error("getLandlordLeases error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* -------------------------------------------------
TENANT: Accept or reject lease
--------------------------------------------------- */
export const respondToLease = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const { response } = req.body;
        const lease = await Lease.findById(req.params.id);

        if (!lease)
            return res.status(404).json({ success: false, message: "Lease not found" });
        if (lease.tenantId.toString() !== tenantId)
            return res.status(403).json({ success: false, message: "Not authorized" });
        if (lease.status !== "PENDING")
            return res.status(400).json({ success: false, message: "Lease is not pending" });

        if (response === "ACCEPT") {
            lease.status = "ACTIVE";
            await lease.save();
            await Unit.findByIdAndUpdate(lease.unitId, { status: "OCCUPIED" });
            return res.json({ success: true, message: "Lease accepted", data: lease });
        } else if (response === "REJECT") {
            lease.status = "REJECTED";
            await lease.save();
            await Unit.findByIdAndUpdate(lease.unitId, { status: "AVAILABLE" });
            return res.json({ success: true, message: "Lease rejected", data: lease });
        }

        res.status(400).json({
            success: false,
            message: "Response must be ACCEPT or REJECT",
        });
    } catch (error) {
        console.error("respondToLease error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* -------------------------------------------------
LANDLORD: Terminate lease manually
--------------------------------------------------- */
export const terminateLease = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const lease = await Lease.findById(req.params.id);
        if (!lease)
            return res.status(404).json({ success: false, message: "Lease not found" });
        if (lease.landlordId.toString() !== landlordId)
            return res.status(403).json({ success: false, message: "Not authorized" });

        lease.status = "TERMINATED";
        await lease.save();
        await Unit.findByIdAndUpdate(lease.unitId, { status: "AVAILABLE" });

        res.json({ success: true, message: "Lease terminated", data: lease });
    } catch (error) {
        console.error("terminateLease error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateLeasePdf = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch lease with relationships
    const lease = await Lease.findById(id)
      .populate({
        path: "unitId",
        populate: { path: "propertyId", select: "name address" },
      })
      .populate("tenantId", "name email")
      .populate("landlordId", "name email");

    if (!lease) {
      return res
        .status(404)
        .json({ success: false, message: "Lease not found" });
    }

    const unit = lease.unitId;
    const property = unit?.propertyId;
    const rent = lease.rentAmount || 0;
    const deposit = lease.depositAmount || 0;
    const dueDay = lease.dueDay || 1;
    const leaseStatus = lease.status || "PENDING";

    // Helpers
    const formatDate = (d) =>
      d
        ? new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—";

    const statusColor = {
      ACTIVE: "#16a34a",
      PENDING: "#ca8a04",
      REJECTED: "#dc2626",
      TERMINATED: "#6b7280",
      EXPIRED: "#6b7280",
    };

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=lease_${id.slice(-8).toUpperCase()}.pdf`
    );

    doc.pipe(res);

    /* ═══════════════ HEADER SECTION ═══════════════ */
    doc.rect(0, 0, doc.page.width, 100).fill("#3E5C52");

    // Logo inside circle
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

    // Title
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("LEASE AGREEMENT", doc.page.width - 230, 35, {
        width: 200,
        align: "right",
      });

    doc.moveDown(4);

    /* ═══════════════ META SECTION ═══════════════ */
    const metaY = 120;

    // Left side - Landlord / Tenant
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("LANDLORD:", 50, metaY);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(lease.landlordId?.name || "—", 50, metaY + 15)
      .text(lease.landlordId?.email || "—", 50, metaY + 28);

    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("TENANT:", 50, metaY + 55);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(lease.tenantId?.name || "—", 50, metaY + 70)
      .text(lease.tenantId?.email || "—", 50, metaY + 83);

    // Right side - Lease metadata
    const rightX = 320;
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("LEASE DETAILS:", rightX, metaY);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(
        `Lease ID: ${id.slice(-8).toUpperCase()}`,
        rightX,
        metaY + 15
      )
      .text(
        `Created: ${formatDate(lease.createdAt)}`,
        rightX,
        metaY + 28
      )
      .text(
        `Start: ${formatDate(lease.startDate)}`,
        rightX,
        metaY + 41
      )
      .text(`End: ${formatDate(lease.endDate)}`, rightX, metaY + 54);

    doc
      .font("Helvetica-Bold")
      .text("Status: ", rightX, metaY + 67, { continued: true })
      .fillColor(statusColor[leaseStatus] || "#6b7280")
      .text(leaseStatus);

    doc.moveDown(4);

    /* ═══════════════ SUMMARY SECTION (LIKE MyLeases) ═══════════════ */
    const sectionY = doc.y + 10;
    const leftColumnX = 50;
    const rightColumnX = 320;

    // Property info
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("PROPERTY:", leftColumnX, sectionY);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(property?.name || "—", leftColumnX, sectionY + 15)
      .text(
        typeof property?.address === "object"
          ? `${property.address.street || ""} ${property.address.city || ""} ${
              property.address.state || ""
            }`
          : property?.address || "—",
        leftColumnX,
        sectionY + 28,
        { width: 220 }
      )
      .text(
        `Unit: ${unit?.unitNumber || "—"} (${
          unit?.type ? String(unit.type).toUpperCase() : "N/A"
        })`,
        leftColumnX,
        sectionY + 45
      );

    // Financial summary
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("FINANCIAL SUMMARY:", rightColumnX, sectionY);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`Monthly Rent: $${rent.toFixed(2)}`, rightColumnX, sectionY + 15)
      .text(
        `Security Deposit: $${deposit.toFixed(2)}`,
        rightColumnX,
        sectionY + 28
      )
      .text(
        `Rent Due: ${dueDay} of each month`,
        rightColumnX,
        sectionY + 41
      )
      .text(
        `Frequency: ${lease.rentFrequency || "MONTHLY"}`,
        rightColumnX,
        sectionY + 54
      );

    doc.moveDown(6);

    /* ═══════════════ KEY TERMS (CONTRACT SUMMARY) ═══════════════ */
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("KEY LEASE TERMS", 50, doc.y);

    doc.moveDown(0.7);

    const bullet = (label, value) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#374151")
        .text(`• ${label}: `, { continued: true })
        .font("Helvetica")
        .fillColor("#4b5563")
        .text(value || "—");
    };

    bullet("Lease Type", lease.leaseType || "FIXED");
    bullet("Payment Method", lease.paymentMethod || "E_TRANSFER");
    bullet(
      "Late Fee",
      lease.lateFeeType === "NONE"
        ? "No late fee"
        : lease.lateFeeType === "FLAT"
        ? `$${(lease.lateFeeValue || 0).toFixed(2)} flat fee`
        : `${lease.lateFeeValue || 0}% of monthly rent`
    );
    bullet("Pets Allowed", lease.petsAllowed || "NO");
    bullet("Smoking Policy", lease.smokingAllowed || "NO");
    bullet("Parking", lease.parkingIncluded || "YES");
    bullet("Furnished", lease.furnished || "NO");
    bullet(
      "Utilities Included",
      lease.utilitiesIncluded || "As per landlord's description"
    );

    doc.moveDown(2);

    /* ═══════════════ FULL CONTRACT DETAILS ═══════════════ */
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("FULL CONTRACT DETAILS", 50, doc.y);

    doc.moveDown(0.8);

    // Lease title & additional terms
    if (lease.leaseTitle) {
      doc
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(lease.leaseTitle, { align: "left" });
      doc.moveDown(0.5);
    }

    // Emergency contact section
    if (lease.emergencyContactName || lease.emergencyContactPhone) {
      doc
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Emergency Contact", 50, doc.y);

      doc
        .font("Helvetica")
        .fillColor("#4b5563")
        .fontSize(10)
        .text(
          `Name: ${lease.emergencyContactName || "—"}`,
          50,
          doc.y + 14
        )
        .text(
          `Phone: ${lease.emergencyContactPhone || "—"}`,
          50,
          doc.y + 27
        );

      doc.moveDown(3);
    }

    // Additional Terms (long text)
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Additional Terms & Conditions", 50, doc.y);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#4b5563")
      .text(
        lease.additionalTerms ||
          "The tenant agrees to abide by all reasonable rules and regulations established by the landlord regarding the use and care of the property. Unless otherwise stated, standard provincial residential tenancy laws apply.",
        50,
        doc.y + 14,
        {
          width: doc.page.width - 100,
          align: "justify",
        }
      );

    doc.moveDown(2);

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
        "This document is a summary and representation of your lease agreement. In case of conflict, the original signed lease takes precedence.",
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
    console.error("generateLeasePdf error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate lease PDF" });
  }
};
