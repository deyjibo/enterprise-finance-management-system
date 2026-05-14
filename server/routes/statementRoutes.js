const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin, isAdminOrManager } = require("../middlewares/authMiddleware");
const { getCustomerStatement } = require("../controllers/statementController");

// Get statement of a customer by phone (admin or manager)
router.get("/customer/:phone", verifyToken, isAdminOrManager, getCustomerStatement);

module.exports = router;
