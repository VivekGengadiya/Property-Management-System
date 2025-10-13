import Property from "../models/Property.js";

// Create new property
export const createProperty = async (req, res) => {
    try {
        const property = await Property.create(req.body);
        res.status(201).json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all properties
export const getProperties = async (req, res) => {
    try {
        const properties = await Property.find();
        res.json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single property
export const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update property
export const updateProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete property
export const deleteProperty = async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Property deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
