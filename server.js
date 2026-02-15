// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // Import
import applicationRoutes from "./routes/applicationRoutes.js"; // Import
import uploadRoutes from "./routes/uploadRoutes.js"; // Import
import Job from "./models/Job.js";

dotenv.config();

const app = express();

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes); // Upload routes
app.use("/api/admin", adminRoutes); // Mount
app.use("/api/admin/applications", applicationRoutes); // Mount application routes

app.get("/", (req, res) => {
  res.send("✅ Job Portal API running");
});

// ---------- MONGODB ----------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobportal")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---------- DELETE EXPIRED JOBS ----------
const deleteExpiredJobs = async () => {
  try {
    const today = new Date();
    const result = await Job.deleteMany({ deadline: { $lt: today } });
    console.log(`🗑️ Deleted ${result.deletedCount} expired jobs`);
  } catch (err) {
    console.error("❌ Error deleting expired jobs:", err);
  }
};

// Run once + every 24 hours
deleteExpiredJobs();
setInterval(deleteExpiredJobs, 24 * 60 * 60 * 1000);

// ---------- SAFE SERVER START ----------
const startServer = (port) => {
  const PORT = Number(port); // 🔥 FORCE NUMBER

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${PORT} busy, trying ${PORT + 1}`);
      startServer(PORT + 1); // ✅ numeric increment
    } else {
      console.error("❌ Server error:", err);
    }
  });
};

// ---------- START ----------
startServer(Number(process.env.PORT) || 5001);

/*import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Job from "./models/Job.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => res.send("Job Portal API running"));

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobportal")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Function to delete expired jobs daily
const deleteExpiredJobs = async () => {
  try {
    const today = new Date();
    const result = await Job.deleteMany({ deadline: { $lt: today } });
    console.log(`🗑️ Deleted ${result.deletedCount} expired jobs`);
  } catch (err) {
    console.error("❌ Error deleting expired jobs:", err);
  }
};

// Run immediately and then every 24 hours
deleteExpiredJobs();
setInterval(deleteExpiredJobs, 24 * 60 * 60 * 1000); // 24 hours

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));*/