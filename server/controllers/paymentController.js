// controllers/paymentController.js

const Invoice = require("../models/Invoice");

// Get all payments (example)
exports.getPayments = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    const payments = invoices.flatMap(inv => inv.payments);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create/Add payment to an invoice
exports.createPayment = async (req, res) => {
  try {
    const { invoiceId } = req.body; // or req.params
    const { amount, mode } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    invoice.payments.push({ amount, mode });

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.remainingDue = invoice.invoiceAmount - totalPaid;

    await invoice.save();

    res.json({ message: "Payment added", invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
