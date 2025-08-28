const express = require("express");
const invoiceController = require("../controller/invoiceController");

const router = express.Router();

// Create Invoice
router.post("/", invoiceController.createInvoice);

// Get all invoices
router.get("/", invoiceController.getInvoices);

// Get single invoice by ID
router.get("/:token", invoiceController.getInvoiceById);

// Update invoice
router.put("/update/:id", invoiceController.updateInvoice);

// Delete invoice
router.delete("/delete/:id", invoiceController.deleteInvoice);

module.exports = router;
