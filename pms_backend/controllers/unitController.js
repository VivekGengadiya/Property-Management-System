import Unit from "../models/Unit.js";

export const createUnit = async (req, res) => {
    try {
        const unit = await Unit.create(req.body);
        res.status(201).json({ success: true, data: unit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUnits = async (req, res) => {
    try {
        const units = await Unit.find();
        res.json({ success: true, data: units });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateUnit = async (req, res) => {
    try {
        const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: unit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteUnit = async (req, res) => {
    try {
        await Unit.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Unit deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
