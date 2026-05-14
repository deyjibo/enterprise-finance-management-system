const Invoice = require("../models/Invoice");

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("customer");
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get invoices by customer
const getInvoicesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const invoices = await Invoice.find({ customer: customerId }).sort({ invoiceDate: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create invoice
const createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true } // <-- updated
    );

    if (!updatedInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json(updatedInvoice);
  } catch (err) {
    res.status(500).json({ message: "Failed to update invoice", error: err.message });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getInvoices,
  getInvoicesByCustomer,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
