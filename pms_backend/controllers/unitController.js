import Unit from "../models/Unit.js";
import Property from "../models/Property.js";

/* -------------------------------------------------
CREATE UNIT
--------------------------------------------------- */
export const createUnit = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

        const { propertyId, unitNumber, bedrooms, bathrooms, rentAmount } = req.body;

        if (!propertyId || !unitNumber) {
            return res.status(400).json({
                success: false,
                message: "propertyId and unitNumber are required",
            });
        }

        // Check property
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        // BUSINESS RULE: HOUSE = only 1 unit allowed
        if (property.propertyType === "HOUSE") {
            const unitCount = await Unit.countDocuments({ propertyId });
            if (unitCount >= 1) {
                return res.status(400).json({
                    success: false,
                    message: "A HOUSE property can only have one unit",
                });
            }
        }

        // Cloudinary: handle one or multiple uploaded images
        const images =
            req.files?.images?.map((file) => file.path) || // file.path = Cloudinary URL
            (req.file ? [req.file.path] : []); // fallback for single upload

        const newUnit = {
            propertyId,
            unitNumber,
            bedrooms,
            bathrooms,
            rentAmount,
            images,
        };

        const unit = await Unit.create(newUnit);
        return res.status(201).json({ success: true, data: unit });
    } catch (err) {
        console.log("UNIT ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/* -------------------------------------------------
   GET UNITS
--------------------------------------------------- */
export const getUnits = async (req, res) => {
    try {
        const filter = {};

        // Optional: Tenant filter for units under a specific property
        if (req.query.propertyId) filter.propertyId = req.query.propertyId;

        const units = await Unit.find(filter).populate("propertyId", "name propertyType address");
        res.json({ success: true, data: units });
    } catch (err) {
        console.error("getUnits error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/* -------------------------------------------------
   GET UNIT BY ID
--------------------------------------------------- */
export const getUnitById = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id).populate("propertyId", "name propertyType address");

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found",
            });
        }

        res.json({ success: true, data: unit });
    } catch (err) {
        console.error("getUnitById error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/* -------------------------------------------------
   UPDATE UNIT
--------------------------------------------------- */
export const updateUnit = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ success: false, message: "Unit not found" });
        }

        // Cloudinary: Replace images if new ones uploaded
        if (req.files?.images?.length > 0) {
            req.body.images = req.files.images.map((file) => file.path);
        } else if (req.file) {
            req.body.images = [req.file.path];
        }

        const updatedUnit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, message: "Unit updated successfully", data: updatedUnit });
    } catch (err) {
        console.error("updateUnit error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/* -------------------------------------------------
   DELETE UNIT
--------------------------------------------------- */
export const deleteUnit = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ success: false, message: "Unit not found" });
        }

        await Unit.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Unit deleted successfully" });
    } catch (err) {
        console.error("deleteUnit error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
