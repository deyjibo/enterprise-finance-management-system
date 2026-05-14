const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("BODY:", req.body);
  console.log("Entered Password:", `"${password}"`);

  try {
    const user = await User.findOne({ email });

    // ❌ USER NOT FOUND
    if (!user) {
      console.log("❌ User NOT found");
      return res.status(400).json({ message: "User not found" });
    }

    console.log("✅ User found:", user.email);
    console.log("🔐 Stored hash:", user.password);

    // 🔑 COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("🧪 Match result:", isMatch);

    // ❌ PASSWORD WRONG
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ GENERATE TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET, // fallback for Electron
      { expiresIn: "1d" }
    );

    console.log("✅ Login successful");

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });

  } catch (err) {
    console.error("🔥 Login Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log("REGISTER BODY:", req.body);

  // ❌ INVALID ROLE
  if (!["admin", "manager"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role. Only admin or manager allowed.",
    });
  }

  try {
    // ❌ ROLE ALREADY EXISTS
    const roleExists = await User.exists({ role });
    if (roleExists) {
      console.log(`❌ ${role} already exists`);
      return res.status(400).json({
        message: `A user with role '${role}' already exists.`,
      });
    }

    // ❌ EMAIL EXISTS
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🔐 Hashed Password:", hashedPassword);

    // ✅ CREATE USER
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    console.log("✅ User registered successfully");

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });

  } catch (err) {
    console.error("🔥 Register Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= ROLES COUNT =================
exports.rolesCount = async (req, res) => {
  try {
    const adminExists = await User.exists({ role: "admin" });
    const managerExists = await User.exists({ role: "manager" });

    res.json({
      admin: !!adminExists,
      manager: !!managerExists,
    });

  } catch (err) {
    console.error("🔥 Roles Count Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};