import { Router } from "express";
import { createPayment, getPayments } from "../controllers/paymentController.js";

const router = Router();

router.post("/", createPayment);
router.get("/", getPayments);

export default router;
