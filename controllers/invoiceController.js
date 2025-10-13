import Invoice from "../models/Invoice.js";

export const createInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.create(req.body);
        res.status(201).json({ success: true, data: invoice });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.json({ success: true, data: invoices });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
