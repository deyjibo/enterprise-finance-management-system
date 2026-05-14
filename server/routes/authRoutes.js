const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const User = require("../models/User");

// Login
router.post("/login", login);

// Register (first Admin / first Manager only)
router.post("/register", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "manager"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const roleExists = await User.exists({ role });
    if (roleExists) {
      return res.status(400).json({ message: `${role} already registered` });
    }

    return register(req, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Check roles
router.get("/roles-count", async (req, res) => {
  try {
    const adminExists = await User.exists({ role: "admin" });
    const managerExists = await User.exists({ role: "manager" });
    res.json({ admin: !!adminExists, manager: !!managerExists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;