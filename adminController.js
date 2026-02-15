import User from "../models/User.js";
import Job from "../models/Job.js";
import { logActivity } from "../utils/activityLogger.js";
import ActivityLog from "../models/ActivityLog.js";
import Application from "../models/Application.js";

/* ===========================
   GET DASHBOARD STATS
 =========================== */
export const getStats = async (req, res) => {
    try {
        const currentAdminId = req.user.id;
        // Count only regular users (non-admins)
        const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

        // Count only jobs created by this admin
        const totalJobs = await Job.countDocuments({ createdBy: currentAdminId });
        const activeJobs = await Job.countDocuments({
            createdBy: currentAdminId,
            deadline: { $gte: new Date() },
        });

        // Get matching job IDs for this admin to filter applications
        const adminJobs = await Job.find({ createdBy: currentAdminId }).select("_id");
        const adminJobIds = adminJobs.map(job => job._id);

        // Count applications for this admin's jobs
        const totalApplications = await Application.countDocuments({ jobId: { $in: adminJobIds } });

        res.status(200).json({
            totalUsers,
            totalJobs,
            activeJobs,
            totalApplications,
        });
    } catch (err) {
        console.error("GET STATS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

/* ===========================
   USER MANAGEMENT
 =========================== */
export const getAllUsers = async (req, res) => {
    try {
        // Fetch only regular users
        const users = await User.find({ role: { $ne: "admin" } }).select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        console.error("GET ALL USERS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const getAllAdmins = async (req, res) => {
    try {
        // Fetch only admins
        const admins = await User.find({ role: "admin" }).select("-password").sort({ createdAt: -1 });
        res.status(200).json(admins);
    } catch (err) {
        console.error("GET ALL ADMINS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch admins" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await logActivity(req.user.id, "DELETE_USER", "USER", user._id, `Deleted user ${user.email}`, req);
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("DELETE USER ERROR:", err);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

/* ===========================
   JOB MANAGEMENT (ADMIN)
 =========================== */
export const getAllJobsAdmin = async (req, res) => {
    try {
        const jobs = await Job.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (err) {
        console.error("GET ALL JOBS ADMIN ERROR:", err);
        res.status(500).json({ message: "Failed to fetch jobs" });
    }
};

/* ===========================
   TOGGLE FEATURED JOB
 =========================== */
export const toggleJobFeatured = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check ownership
        if (job.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to toggle featured status for this job" });
        }

        job.featured = !job.featured;
        await job.save();

        await logActivity(
            req.user.id,
            "TOGGLE_FEATURED",
            "JOB",
            job._id,
            `Job ${job.title} ${job.featured ? 'marked as featured' : 'removed from featured'}`,
            req
        );

        res.status(200).json({
            message: `Job ${job.featured ? 'featured' : 'unfeatured'} successfully`,
            job,
        });
    } catch (err) {
        console.error("TOGGLE FEATURED ERROR:", err);
        res.status(500).json({ message: "Failed to toggle featured status" });
    }
};

export const deleteJobAdmin = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check ownership
        if (job.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this job" });
        }

        if (job) {
            await logActivity(
                req.user.id,
                "DELETE_JOB",
                "JOB",
                job._id,
                `Deleted job ${job.title} at ${job.company}`,
                req
            );
        }
        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (err) {
        console.error("DELETE JOB ADMIN ERROR:", err);
        res.status(500).json({ message: "Failed to delete job" });
    }
};

/* ===========================
   CLONE JOB
 =========================== */
export const cloneJob = async (req, res) => {
    try {
        const originalJob = await Job.findById(req.params.id);
        if (!originalJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        const jobData = originalJob.toObject();
        delete jobData._id;
        delete jobData.createdAt;
        delete jobData.updatedAt;
        jobData.title = `${jobData.title} (Copy)`;
        jobData.createdBy = req.user.id; // Ensure the clone is owned by the cloner

        const clonedJob = await Job.create(jobData);

        await logActivity(
            req.user.id,
            "CLONE_JOB",
            "JOB",
            originalJob._id,
            `Cloned job ${originalJob.title} as ${clonedJob.title}`,
            req
        );

        res.status(201).json({
            message: "Job cloned successfully",
            job: clonedJob,
        });
    } catch (err) {
        console.error("CLONE JOB ERROR:", err);
        res.status(500).json({ message: "Failed to clone job" });
    }
};

/* ===========================
   GET ADVANCED ANALYTICS
 =========================== */
export const getAdvancedStats = async (req, res) => {
    try {
        const currentAdminId = req.user.id;
        // Get matching job IDs for this admin
        const adminJobs = await Job.find({ createdBy: currentAdminId }).select("_id");
        const adminJobIds = adminJobs.map(job => job._id);

        // Basic stats - Filtered by Admin
        const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
        const totalJobs = await Job.countDocuments({ createdBy: currentAdminId });
        const activeJobs = await Job.countDocuments({
            createdBy: currentAdminId,
            deadline: { $gte: new Date() },
        });

        const totalApplications = await Application.countDocuments({ jobId: { $in: adminJobIds } });

        // Application status breakdown - Filtered by Admin
        const pendingApps = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Pending" });
        const shortlistedApps = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Shortlisted" });
        const rejectedApps = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Rejected" });
        const hiredApps = await Application.countDocuments({ jobId: { $in: adminJobIds }, status: "Hired" });

        // Recent stats (last 7 days) - Filtered by Admin
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentUsers = await User.countDocuments({
            role: { $ne: "admin" },
            createdAt: { $gte: sevenDaysAgo },
        });

        const recentJobs = await Job.countDocuments({
            createdBy: currentAdminId,
            createdAt: { $gte: sevenDaysAgo },
        });

        const recentApplications = await Application.countDocuments({
            jobId: { $in: adminJobIds },
            appliedAt: { $gte: sevenDaysAgo },
        });

        // Trends calculations (last 30 days) - Filtered by Admin
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Application trends - Filtered by Admin
        const applicationTrends = await Application.aggregate([
            {
                $match: {
                    jobId: { $in: adminJobIds },
                    appliedAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$appliedAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        // User registration trends (Keeping global pool but can be thought of as platform-wide)
        const userTrends = await User.aggregate([
            {
                $match: {
                    role: { $ne: "admin" },
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        // Top Jobs by Applications - Filtered by Admin
        const topJobs = await Application.aggregate([
            {
                $match: { jobId: { $in: adminJobIds } }
            },
            {
                $group: {
                    _id: "$jobId",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 5,
            },
            {
                $lookup: {
                    from: "jobs",
                    localField: "_id",
                    foreignField: "_id",
                    as: "jobDetails",
                },
            },
            {
                $unwind: "$jobDetails",
            },
            {
                $project: {
                    title: "$jobDetails.title",
                    company: "$jobDetails.company",
                    count: 1,
                },
            },
        ]);

        res.status(200).json({
            basic: {
                totalUsers,
                totalJobs,
                activeJobs,
                totalApplications,
            },
            applicationStatus: {
                pending: pendingApps,
                shortlisted: shortlistedApps,
                rejected: rejectedApps,
                hired: hiredApps,
            },
            recent: {
                newUsers: recentUsers,
                newJobs: recentJobs,
                newApplications: recentApplications,
            },
            trends: applicationTrends,
            userTrends: userTrends,
            topJobs: topJobs,
        });
    } catch (err) {
        console.error("GET ADVANCED STATS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch advanced statistics" });
    }
};

/* ===========================
   ACTIVITY LOGS
 =========================== */
export const getActivityLogs = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const logs = await ActivityLog.find({ adminId: req.user.id })
            .populate("adminId", "name email")
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json(logs);
    } catch (err) {
        console.error("GET ACTIVITY LOGS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch activity logs" });
    }
};

/* ===========================
   EXPORT DATA
 =========================== */
export const exportData = async (req, res) => {
    try {
        const { type } = req.params;
        const { convertToCSV } = await import("../utils/exportHelper.js");
        let data = [];
        let filename = `export_${type}_${Date.now()}.csv`;

        if (type === "applications") {
            const adminJobs = await Job.find({ createdBy: req.user.id }).select("_id");
            const adminJobIds = adminJobs.map(job => job._id);

            const apps = await Application.find({ jobId: { $in: adminJobIds } })
                .populate("userId", "name email")
                .populate("jobId", "title company");
            data = apps.map(app => ({
                Applicant: app.fullName || app.userId?.name || "N/A",
                Email: app.email || app.userId?.email || "N/A",
                Phone: app.phone || "N/A",
                Job: app.jobId?.title || "N/A",
                Company: app.jobId?.company || "N/A",
                Status: app.status,
                AppliedAt: app.appliedAt.toISOString(),
            }));
        } else if (type === "jobs") {
            const jobs = await Job.find({ createdBy: req.user.id });
            data = jobs.map(job => ({
                Title: job.title,
                Company: job.company,
                Location: job.location,
                Type: job.jobType,
                Featured: job.featured,
                CreatedAt: job.createdAt.toISOString(),
            }));
        } else if (type === "users") {
            const users = await User.find({ role: { $ne: "admin" } });
            data = users.map(user => ({
                Name: user.name,
                Email: user.email,
                JoinedAt: user.createdAt.toISOString(),
            }));
        } else {
            return res.status(400).json({ message: "Invalid export type" });
        }

        const csv = convertToCSV(data);
        res.header("Content-Type", "text/csv");
        res.attachment(filename);
        res.send(csv);

        await logActivity(req.user.id, "EXPORT_DATA", "SYSTEM", null, `Exported ${type} data`, req);
    } catch (err) {
        console.error("EXPORT DATA ERROR:", err);
        res.status(500).json({ message: "Failed to export data" });
    }
};
