import express from "express";
import Job from "../models/Job.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

/* =========================
   GET ALL JOBS (PUBLIC)
========================= */
router.get("/", async (req, res) => {
  try {
    const today = new Date();

    const jobs = await Job.find({
      $or: [
        { deadline: { $gte: today } },
        { deadline: null },
        { deadline: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

/* =========================
   GET JOB BY ID (PUBLIC)
========================= */
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (err) {
    console.error("GET JOB ERROR:", err);
    res.status(500).json({ message: "Invalid job ID" });
  }
});

/* =========================
   CREATE JOB (ADMIN)
========================= */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const jobData = { ...req.body, createdBy: req.user.id };
      const job = await Job.create(jobData);

      await logActivity(
        req.user.id,
        "CREATE_JOB",
        "JOB",
        job._id,
        `Created job ${job.title} at ${job.company}`,
        req
      );

      res.status(201).json({
        message: "Job created successfully",
        job,
      });
    } catch (err) {
      console.error("CREATE JOB ERROR:", err);
      res.status(500).json({ message: "Failed to create job" });
    }
  }
);

/* =========================
   UPDATE JOB (ADMIN)
========================= */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check ownership
      if (job.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to update this job" });
      }

      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      await logActivity(
        req.user.id,
        "UPDATE_JOB",
        "JOB",
        updatedJob._id,
        `Updated job ${updatedJob.title} at ${updatedJob.company}`,
        req
      );

      res.status(200).json({
        message: "Job updated successfully",
        job: updatedJob,
      });
    } catch (err) {
      console.error("UPDATE JOB ERROR:", err);
      res.status(500).json({ message: "Failed to update job" });
    }
  }
);

/* =========================
   DELETE JOB (ADMIN)
========================= */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check ownership
      if (job.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to delete this job" });
      }

      const deletedJob = await Job.findByIdAndDelete(req.params.id);

      await logActivity(
        req.user.id,
        "DELETE_JOB",
        "JOB",
        job._id,
        `Deleted job ${job.title} at ${job.company}`,
        req
      );

      res.status(200).json({ message: "Job deleted successfully" });
    } catch (err) {
      console.error("DELETE JOB ERROR:", err);
      res.status(500).json({ message: "Failed to delete job" });
    }
  }
);

export default router;


/*import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

// GET ALL JOBS
router.get("/", async (req, res) => {
  try {
    const today = new Date();

    const jobs = await Job.find({
      $or: [
        { deadline: { $gte: today } }, // future jobs
        { deadline: { $exists: false } }, // no deadline
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// GET JOB BY ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (err) {
    console.error("GET JOB BY ID ERROR:", err);
    res.status(500).json({ message: "Invalid Job ID" });
  }
});

export default router;*/