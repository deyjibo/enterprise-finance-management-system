const express = require("express");
const router = express.Router();
const { verifyToken, isAdminOrManager } = require("../middlewares/authMiddleware");
const {
  getInvoices,
  getInvoicesByCustomer,
  createInvoice,
  updateInvoice,
  deleteInvoice, // make sure this exists
} = require("../controllers/invoiceController");

// Routes
router.get("/", verifyToken, isAdminOrManager, getInvoices);
router.get("/customer/:customerId", verifyToken, isAdminOrManager, getInvoicesByCustomer);
router.post("/", verifyToken, isAdminOrManager, createInvoice);

// Update invoice
router.put("/:id", verifyToken, isAdminOrManager, updateInvoice);

// Delete invoice
router.delete("/:id", verifyToken, isAdminOrManager, deleteInvoice);

module.exports = router;
