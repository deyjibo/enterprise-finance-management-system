const jwt = require("jsonwebtoken");

// ✅ Verify logged-in user
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ❌ No token
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // ✅ Support BOTH formats:
    // 1. "Bearer <token>"
    // 2. "<token>"
    let token;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    // ❌ If token still missing
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user
    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

// ✅ Admin only
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// ✅ Manager only
exports.isManager = (req, res, next) => {
  if (!req.user || req.user.role !== "manager") {
    return res.status(403).json({ message: "Manager access only" });
  }
  next();
};

// ✅ Admin OR Manager
exports.isAdminOrManager = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (req.user.role === "admin" || req.user.role === "manager") {
    return next();
  }

  return res.status(403).json({ message: "Access denied" });
};