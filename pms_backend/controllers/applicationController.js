import Application from "../models/Application.js";

export const createApplication = async (req, res) => {
    try {
        const application = await Application.create(req.body);
        res.status(201).json({ success: true, data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getApplications = async (req, res) => {
    try {
        const apps = await Application.find();
        res.json({ success: true, data: apps });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
