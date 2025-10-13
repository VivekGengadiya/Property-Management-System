import MaintenanceTicket from "../models/MaintenanceTicket.js";

export const createTicket = async (req, res) => {
    try {
        const ticket = await MaintenanceTicket.create(req.body);
        res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getTickets = async (req, res) => {
    try {
        const tickets = await MaintenanceTicket.find();
        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
