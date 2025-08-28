const jwt = require("jsonwebtoken");
const Invoice = require("../models/invoiceModel");

const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const nextNumber = String(count + 1).padStart(4, "0");
  return `INV-${new Date().getFullYear()}-${nextNumber}`;
};

exports.createInvoice = async (req, res) => {
  try {
    const { token, items, dueDate, notes } = req.body;

    if (!token || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Token, items and dueDate are required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Calculate totals
    const calculatedItems = items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
    }));
    const totalAmount = calculatedItems.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    console.log(
      invoiceNumber,
      decoded.id, // <-- important
      calculatedItems,
      dueDate,
      totalAmount,
      notes
    );

    const invoice = new Invoice({
      invoiceNumber,
      customer: decoded.id, // <-- important
      items: calculatedItems,
      dueDate,
      totalAmount,
      notes,
    });

    await invoice.save();

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    console.log(decoded);

    const invoice = await Invoice.findOne({ customer: decoded.id });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { items, dueDate, notes, status } = req.body;
    let updateData = { dueDate, notes, status };

    // recalc totals if items updated
    if (items) {
      const calculatedItems = items.map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));
      updateData.items = calculatedItems;
      updateData.totalAmount = calculatedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }
    res.status(200).json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
