import Application from "../models/Application.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import { logActivity } from "../utils/activityLogger.js";

/* ===========================
   GET ALL APPLICATIONS
 =========================== */
export const getAllApplications = async (req, res) => {
    try {
        // Filter by jobs created by this admin
        const adminJobs = await Job.find({ createdBy: req.user.id }).select("_id");
        const adminJobIds = adminJobs.map(job => job._id);

        const applications = await Application.find({ jobId: { $in: adminJobIds } })
            .populate("userId", "name email username")
            .populate("jobId", "title company location createdBy")
            .sort({ appliedAt: -1 });

        res.status(200).json(applications);
    } catch (err) {
        console.error("GET ALL APPLICATIONS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
};

/* ===========================
   GET APPLICATION BY ID
 =========================== */
export const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate("userId", "name email username location experience education skills languages")
            .populate("jobId");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Check if the current admin created the job
        if (application.jobId.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to view this application" });
        }

        res.status(200).json(application);
    } catch (err) {
        console.error("GET APPLICATION ERROR:", err);
        res.status(500).json({ message: "Failed to fetch application" });
    }
};

/* ===========================
   UPDATE APPLICATION STATUS
 =========================== */
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!["Pending", "Under Review", "Shortlisted", "Rejected", "Hired"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        let application = await Application.findById(req.params.id).populate("jobId");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Check ownership
        if (application.jobId.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this application" });
        }

        application = await Application.findByIdAndUpdate(
            req.params.id,
            { status, notes: notes || "" },
            { new: true }
        )
            .populate("userId", "name email username")
            .populate("jobId", "title company");

        await logActivity(
            req.user.id,
            "UPDATE_APPLICATION_STATUS",
            "APPLICATION",
            application._id,
            `Updated application status for ${application.fullName || application.userId?.name} to ${status}`,
            req
        );

        res.status(200).json({
            message: "Application status updated successfully",
            application,
        });
    } catch (err) {
        console.error("UPDATE APPLICATION STATUS ERROR:", err);
        res.status(500).json({ message: "Failed to update application status" });
    }
};

/* ===========================
   DELETE APPLICATION
 =========================== */
export const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate("jobId");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Check ownership
        if (application.jobId.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this application" });
        }

        await Application.findByIdAndDelete(req.params.id);

        // Remove from user's appliedJobs array
        await User.findByIdAndUpdate(application.userId, {
            $pull: { appliedJobs: application.jobId },
        });

        await logActivity(
            req.user.id,
            "DELETE_APPLICATION",
            "APPLICATION",
            application._id,
            `Deleted application for job ${application.jobId}`,
            req
        );

        res.status(200).json({ message: "Application deleted successfully" });
    } catch (err) {
        console.error("DELETE APPLICATION ERROR:", err);
        res.status(500).json({ message: "Failed to delete application" });
    }
};

/* ===========================
   GET APPLICATION STATISTICS
 =========================== */
export const getApplicationStats = async (req, res) => {
    try {
        // Filter by jobs created by this admin
        const adminJobs = await Job.find({ createdBy: req.user.id }).select("_id");
        const adminJobIds = adminJobs.map(job => job._id);

        const totalApplications = await Application.countDocuments({ jobId: { $in: adminJobIds } });
        const pendingCount = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Pending" });
        const underReviewCount = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Under Review" });
        const shortlistedCount = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Shortlisted" });
        const rejectedCount = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Rejected" });
        const hiredCount = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Hired" });

        // Get recent applications (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentApplications = await Application.countDocuments({
            jobId: { $in: adminJobIds },
            appliedAt: { $gte: sevenDaysAgo },
        });

        res.status(200).json({
            totalApplications,
            pendingCount,
            underReviewCount,
            shortlistedCount,
            rejectedCount,
            hiredCount,
            recentApplications,
        });
    } catch (err) {
        console.error("GET APPLICATION STATS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch application statistics" });
    }
};

/* ===========================
   FILTER APPLICATIONS
 =========================== */
export const filterApplications = async (req, res) => {
    try {
        const { jobId, userId, status, startDate, endDate, searchTerm, jobType } = req.body;

        let filter = {};

        // Always restrict to current admin's jobs
        const adminJobs = await Job.find({ createdBy: req.user.id }).select("_id");
        const adminJobIds = adminJobs.map(job => job._id);

        filter.jobId = { $in: adminJobIds };
        if (jobId) {
            // Verify the specific jobId belongs to the admin
            if (!adminJobIds.some(id => id.toString() === jobId)) {
                return res.status(403).json({ message: "You are not authorized to filter applications for this job" });
            }
            filter.jobId = jobId;
        }

        if (userId) filter.userId = userId;
        if (status && status.length > 0) {
            filter.status = { $in: status };
        }
        if (startDate || endDate) {
            filter.appliedAt = {};
            if (startDate) filter.appliedAt.$gte = new Date(startDate);
            if (endDate) filter.appliedAt.$lte = new Date(endDate);
        }

        let applications = await Application.find(filter)
            .populate("userId", "name email username")
            .populate("jobId", "title company location jobType category createdBy")
            .sort({ appliedAt: -1 });

        // Filter by jobType if provided
        if (jobType && jobType.trim() !== "") {
            const targetType = jobType.toLowerCase();
            applications = applications.filter(app =>
                app.jobId?.jobType?.toLowerCase() === targetType ||
                app.jobId?.category?.toLowerCase() === targetType
            );
        }

        // Search by user name or email if searchTerm provided
        if (searchTerm && searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            applications = applications.filter(
                (app) =>
                    app.userId?.name?.toLowerCase().includes(term) ||
                    app.userId?.email?.toLowerCase().includes(term) ||
                    app.userId?.username?.toLowerCase().includes(term) ||
                    app.jobId?.title?.toLowerCase().includes(term) ||
                    app.jobId?.company?.toLowerCase().includes(term)
            );
        }

        res.status(200).json(applications);
    } catch (err) {
        console.error("FILTER APPLICATIONS ERROR:", err);
        res.status(500).json({ message: "Failed to filter applications" });
    }
};

/* ===========================
   BULK UPDATE STATUS
 =========================== */
export const bulkUpdateStatus = async (req, res) => {
    try {
        const { applicationIds, status } = req.body;

        if (!applicationIds || applicationIds.length === 0) {
            return res.status(400).json({ message: "No applications selected" });
        }

        if (!["Pending", "Under Review", "Shortlisted", "Rejected", "Hired"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Verify ownership for all applications
        const applications = await Application.find({ _id: { $in: applicationIds } }).populate("jobId");
        const allOwned = applications.every(app => app.jobId.createdBy.toString() === req.user.id);

        if (!allOwned) {
            return res.status(403).json({ message: "You are not authorized to update one or more of these applications" });
        }

        await Application.updateMany(
            { _id: { $in: applicationIds } },
            { status }
        );

        await logActivity(
            req.user.id,
            "BULK_UPDATE_STATUS",
            "APPLICATION",
            null,
            `Updated status to ${status} for ${applicationIds.length} applications`,
            req
        );

        res.status(200).json({
            message: `${applicationIds.length} application(s) updated successfully`,
        });
    } catch (err) {
        console.error("BULK UPDATE STATUS ERROR:", err);
        res.status(500).json({ message: "Failed to bulk update applications" });
    }
};

/* ===========================
   GET APPLICATIONS BY JOB
 =========================== */
export const getApplicationsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to view applications for this job" });
        }

        const applications = await Application.find({ jobId })
            .populate("userId", "name email username location experience")
            .sort({ appliedAt: -1 });

        const stats = {
            total: applications.length,
            pending: applications.filter((app) => app.status === "Pending").length,
            underReview: applications.filter((app) => app.status === "Under Review").length,
            shortlisted: applications.filter((app) => app.status === "Shortlisted").length,
            rejected: applications.filter((app) => app.status === "Rejected").length,
            hired: applications.filter((app) => app.status === "Hired").length,
        };

        res.status(200).json({ applications, stats });
    } catch (err) {
        console.error("GET APPLICATIONS BY JOB ERROR:", err);
        res.status(500).json({ message: "Failed to fetch applications for job" });
    }
};
