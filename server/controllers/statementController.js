const Invoice = require("../models/Invoice");

// Get customer financial statement
const getCustomerStatement = async (req, res) => {
  try {
    const { phone } = req.params;

    // find all invoices of customer
    const invoices = await Invoice.find({ phone });

    if (!invoices.length) {
      return res.status(404).json({
        message: "No records found"
      });
    }

    let totalBilling = 0;
    let totalPaid = 0;
    let totalDue = 0;

    const statement = invoices.map(inv => {
      const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);

      totalBilling += inv.invoiceAmount;
      totalPaid += paid;
      totalDue += inv.remainingDue;

      return {
        billNo: inv.billNo,
        billingDate: inv.billingDate,
        invoiceAmount: inv.invoiceAmount,
        paidAmount: paid,
        remainingDue: inv.remainingDue,
        payments: inv.payments
      };
    });

    res.json({
      customerPhone: phone,
      totalBilling,
      totalPaid,
      totalDue,
      invoices: statement
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export all functions from this controller
module.exports = {
  getCustomerStatement,
};
