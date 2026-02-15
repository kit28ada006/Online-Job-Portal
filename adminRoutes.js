import express from "express";
import {
    getStats,
    getAllUsers,
    getAllAdmins,
    deleteUser,
    toggleJobFeatured,
    cloneJob,
    getAdvancedStats,
    getActivityLogs,
    exportData,
    getAllJobsAdmin,
    deleteJobAdmin,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// All routes require Auth + Admin
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get("/stats", getStats);

// Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Admins (New)
router.get("/admins", getAllAdmins);

// Jobs
router.get("/jobs", getAllJobsAdmin);
router.delete("/jobs/:id", deleteJobAdmin);
router.put("/jobs/:id/featured", toggleJobFeatured);
router.post("/jobs/:id/clone", cloneJob);

// Advanced Analytics
router.get("/analytics", getAdvancedStats);

// Activity Logs
router.get("/activity", getActivityLogs);

// Export
router.get("/export/:type", exportData);

export default router;
