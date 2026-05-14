// server/server.js
require("dotenv").config({ path: __dirname + "/.env" });
console.log("Server starting...");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const collectionRoutes = require("./routes/collectionRoutes");
const fs = require("fs-extra");
const path = require("path");
const { MongoClient } = require("mongodb");
const cron = require("node-cron");

const app = express();
app.use(
  cors({
    origin: "*", // allow all (for Electron)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);
app.use(express.json());

let ready = false; // ✅ Backend ready flag

// ================= MONGODB CONNECTION =================
const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/finance_system";

function connectWithRetry() {
  console.log("Connecting to MongoDB...");

  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("MongoDB connected ✅");
    })
    .catch((err) => {
      console.error(
        "MongoDB connection failed, retrying in 2s...",
        err.message
      );
      setTimeout(connectWithRetry, 2000);
    });
}

connectWithRetry();

// ================= API ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/statements", require("./routes/statementRoutes"));
app.use("/api/collections", collectionRoutes);

// ================= REACT FRONTEND =================
// const reactBuildPath = path.join(
//   __dirname,
//   "../finance-frontend/build"
// );

// app.use(express.static(reactBuildPath));

// // ✅ FIXED (Express v5 compatible — no "*" route)
// app.use((req, res) => {
//   res.sendFile(path.join(reactBuildPath, "index.html"));
// });

// ================= BACKUP =================
const BACKUP_FOLDER = path.join(__dirname, "..", "backup");

async function performBackup() {
  try {
    if (await fs.pathExists(BACKUP_FOLDER)) {
      await fs.remove(BACKUP_FOLDER);
    }

    fs.ensureDirSync(BACKUP_FOLDER);

    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const backupPath = path.join(BACKUP_FOLDER, `backup-${timestamp}`);
    fs.ensureDirSync(backupPath);

    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db();

    const collections = await db.collections();

    for (const col of collections) {
      const data = await col.find({}).toArray();
      const filePath = path.join(
        backupPath,
        `${col.collectionName}.json`
      );
      await fs.writeJson(filePath, data, { spaces: 2 });
    }

    await client.close();

    console.log("Backup completed!");
    return { success: true };
  } catch (err) {
    console.error("Backup failed:", err.message);
    return { success: false };
  }
}

// Manual backup
app.post("/api/backup", async (req, res) => {
  const result = await performBackup();
  result.success ? res.json(result) : res.status(500).json(result);
});

// Scheduled backup
cron.schedule("0 20 * * *", async () => {
  console.log("Running scheduled backup...");
  await performBackup();
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
  ready = true; // ✅ IMPORTANT
});

// ================= EXPORT =================
module.exports = {
  isReady: () => ready,
};