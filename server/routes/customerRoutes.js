const express = require("express");
const router = express.Router();
const { verifyToken, isAdminOrManager } = require("../middlewares/authMiddleware");
const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require("../controllers/customerController");

router.get("/", verifyToken, isAdminOrManager, getCustomers);
router.post("/", verifyToken, isAdminOrManager, createCustomer);
router.put("/:id", verifyToken, isAdminOrManager, updateCustomer);
router.delete("/:id", verifyToken, isAdminOrManager, deleteCustomer);

module.exports = router;
