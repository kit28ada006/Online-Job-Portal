// routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import Application from "../models/Application.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* TEST DB (TEMP) */
router.get("/test-db", async (req, res) => {
  const users = await User.find({ role: "admin" }).select("-password");
  res.json(users);
});

/* SAVE / UNSAVE JOB */
router.put("/save-job", authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySaved = user.savedJobs.includes(jobId);
    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();
    res.status(200).json({ message: "Job updated successfully", savedJobs: user.savedJobs });
  } catch (err) {
    console.error("SAVE JOB ERROR:", err);
    res.status(500).json({ message: "Failed to save job" });
  }
});

/* SUBMIT JOB APPLICATION WITH DETAILS */
router.post("/apply-job", authMiddleware, async (req, res) => {
  try {
    const { jobId, fullName, email, phone, experience, skills, coverLetter, resume } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already applied (using string comparison for safety)
    const alreadyApplied = user.appliedJobs.some(id => id.toString() === jobId);
    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    // Add to user's appliedJobs array
    user.appliedJobs.push(jobId);
    await user.save();

    // Create Application document with full details
    const application = await Application.create({
      userId: req.user.id,
      jobId: jobId,
      fullName: fullName,
      email: email,
      phone: phone,
      experience: experience || "",
      skills: skills || "",
      coverLetter: coverLetter || "",
      resume: resume || "",
      status: "Pending",
      appliedAt: new Date(),
    });

    // Note: User activities are NOT logged to the admin activity log table
    // The admin activity log is only for tracking admin actions

    res.status(200).json({
      message: "Application submitted successfully",
      application: application
    });
  } catch (err) {
    console.error("APPLY JOB ERROR:", err);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

/* FETCH SAVED JOBS */
router.get("/saved-jobs", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("savedJobs")
      .select("-password");

    res.status(200).json(user.savedJobs);
  } catch (err) {
    console.error("FETCH SAVED JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch saved jobs" });
  }
});

/* FETCH APPLIED JOBS HISTORY */
router.get("/applied-jobs", authMiddleware, async (req, res) => {
  try {
    // Fetch applications for the current user and populate job details
    const applications = await Application.find({ userId: req.user.id })
      .populate("jobId", "title company location companyLogo")
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    console.error("FETCH APPLIED JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch applied jobs" });
  }
});

/* UPDATE USER PROFILE */
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update common fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    user.contact = req.body.contact ?? user.contact;
    user.state = req.body.state ?? user.state;
    user.city = req.body.city ?? user.city;
    user.about = req.body.about ?? user.about;
    user.expectedSalary = req.body.expectedSalary ?? user.expectedSalary;
    user.experience = req.body.experience ?? user.experience;
    user.jobRole = req.body.jobRole ?? user.jobRole;
    user.education = req.body.education ?? user.education;

    // Update Admin specific fields (Unconditional for safety)
    user.companyName = req.body.companyName ?? user.companyName;
    user.designation = req.body.designation ?? user.designation;
    user.website = req.body.website ?? user.website;

    // Update Social & Professional
    user.linkedin = req.body.linkedin ?? user.linkedin;
    user.github = req.body.github ?? user.github;
    user.portfolio = req.body.portfolio ?? user.portfolio;
    user.skills = Array.isArray(req.body.skills) ? req.body.skills : user.skills;
    user.languages = Array.isArray(req.body.languages) ? req.body.languages : user.languages;
    user.certifications = Array.isArray(req.body.certifications) ? req.body.certifications : user.certifications;

    const updatedUser = await user.save();

    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse,
      received: {
        contact: req.body.contact,
        website: req.body.website,
        companyName: req.body.companyName,
        designation: req.body.designation
      }
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});

export default router;