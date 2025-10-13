import Payment from "../models/Payment.js";

export const createPayment = async (req, res) => {
    try {
        const payment = await Payment.create(req.body);
        res.status(201).json({ success: true, data: payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find();
        res.json({ success: true, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
