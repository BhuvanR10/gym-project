require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { fetchAttendanceFromDevice } = require("./services/biometricService");
const { syncAttendanceFromDevice } = require("./services/biometricSync");
const biometricRoutes = require("./routes/biometric");


const app = express();

// ================= Middleware =================
app.use(cors());
app.use(express.json());

// ================= Database =================
require("./config/db");

// ================= Routes =================
const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/members");
const attendanceRoutes = require("./routes/attendance");
const dashboardRoutes = require("./routes/dashboard");


// ✅ CORRECT IMPORT (IMPORTANT)
const { sendExpiryReminders } = require("./services/reminderService");

// ================= Use Routes =================
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/biometric", biometricRoutes);


// ==================================================
// 📧 CRON JOB – EMAIL EXPIRY REMINDERS (TEST MODE)
// ==================================================

// TEMP: runs every minute for testing
cron.schedule("0 9 * * *", () => {
  console.log("📧 TEST MODE: Running expiry reminder job...");
  sendExpiryReminders();
});

// ==================================================
cron.schedule("0 9 * * *", () => {
  syncAttendanceFromDevice();
});

cron.schedule("0 9 * * *", () => {
  console.log("🔄 Pulling attendance from biometric...");
  fetchAttendanceFromDevice();
});
// ================= Start Server =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
