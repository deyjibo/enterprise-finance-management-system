// collectionRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, isAdminOrManager } = require("../middlewares/authMiddleware");
const {
  createCollection,
  getCollections,            // ← make sure this is imported
  getCollectionsByCustomer,
  updateCollection,
  deleteCollection
} = require("../controllers/collectionController");

// Create collection
router.post("/", verifyToken, isAdminOrManager, createCollection);

// Get all collections
router.get("/", verifyToken, isAdminOrManager, getCollections);

// Get collections by customer
router.get("/customer/:customerId", verifyToken, isAdminOrManager, getCollectionsByCustomer);

// Update collection
router.put("/:id", verifyToken, isAdminOrManager, updateCollection);

// Delete collection
router.delete("/:id", verifyToken, isAdminOrManager, deleteCollection);

module.exports = router;
