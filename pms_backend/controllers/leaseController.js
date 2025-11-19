import Lease from "../models/Lease.js";
import Unit from "../models/Unit.js";
import Application from "../models/Application.js";
import Property from "../models/Property.js";

/* -------------------------------------------------
Create lease after approving application
--------------------------------------------------- */
export const createLease = async (req, res) => {
    try {
        const { applicationId, startDate, endDate, dueDay } = req.body;
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
            startDate,
            endDate,
            rentAmount,
            depositAmount,
            dueDay: dueDay || 1,
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
