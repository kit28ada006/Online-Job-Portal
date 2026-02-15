import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication,
    getApplicationStats,
    filterApplications,
    bulkUpdateStatus,
    getApplicationsByJob,
} from "../controllers/applicationController.js";

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authMiddleware, adminMiddleware);

/* ===========================
   APPLICATION MANAGEMENT ROUTES
=========================== */

// Get all applications
router.get("/", getAllApplications);

// Get application statistics
router.get("/stats", getApplicationStats);

// Filter applications
router.post("/filter", filterApplications);

// Bulk update application statuses
router.put("/bulk-update", bulkUpdateStatus);

// Get applications for a specific job
router.get("/job/:jobId", getApplicationsByJob);

// Get single application by ID
router.get("/:id", getApplicationById);

// Update application status
router.put("/:id/status", updateApplicationStatus);

// Delete application
router.delete("/:id", deleteApplication);

export default router;
