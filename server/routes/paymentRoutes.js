const express = require("express");
const router = express.Router();
const {
  verifyToken,
  isAdmin,
  isAdminOrManager,
} = require("../middlewares/authMiddleware");
const { getPayments, createPayment } = require("../controllers/paymentController");

// Get all payments (admin or manager)
router.get("/", verifyToken, isAdminOrManager, getPayments);

// Add payment (admin only)
router.post("/", verifyToken, isAdmin, createPayment);

module.exports = router;
