import { Router } from "express";
import { createInvoice, getInvoices } from "../controllers/invoiceController.js";

const router = Router();

router.post("/", createInvoice);
router.get("/", getInvoices);

export default router;
