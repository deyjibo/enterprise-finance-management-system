const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Collection = require("../models/Collection");

// Get all customers with due amount and last collection date
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();

    // Fetch all invoices & collections
    const invoices = await Invoice.find();
    const collections = await Collection.find();

    const data = customers.map((c) => {
      // Filter invoices and collections for this customer
      const custInvoices = invoices.filter(
        (inv) => inv.customer.toString() === c._id.toString()
      );
      const custCollections = collections.filter(
        (col) => col.customer.toString() === c._id.toString()
      );

      // Calculate totals
      const totalInvoice = custInvoices.reduce(
        (sum, inv) => sum + (inv.invoiceAmount || 0),
        0
      );
      const totalPaid = custCollections.reduce(
        (sum, col) => sum + (col.collectionAmount || 0),
        0
      );

      // Last collection date
      const lastCollection = custCollections.length
        ? custCollections.reduce((latest, col) =>
            new Date(col.collectionDate) > new Date(latest.collectionDate)
              ? col
              : latest
          )
        : null;

      return {
        ...c._doc, // include all original customer fields
        dueAmount: totalInvoice - totalPaid,
        lastCollectionDate: lastCollection?.collectionDate || null,
      };
    });

    res.json(data);
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ message: "Failed to fetch customers", error: err.message });
  }
};

// Create customer
const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true } 
    );
    if (!updatedCustomer)
      return res.status(404).json({ message: "Customer not found" });

    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ message: "Failed to update customer", error: err.message });
  }
};

// Delete customer and associated invoices & collections
const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    await Invoice.deleteMany({ customer: customerId });
    await Collection.deleteMany({ customer: customerId });

    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    if (!deletedCustomer)
      return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer and associated invoices & collections deleted successfully" });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ message: "Failed to delete customer", error: err.message });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
