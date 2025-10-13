import Lease from "../models/Lease.js";

export const createLease = async (req, res) => {
    try {
        const lease = await Lease.create(req.body);
        res.status(201).json({ success: true, data: lease });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getLeases = async (req, res) => {
    try {
        const leases = await Lease.find();
        res.json({ success: true, data: leases });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
