import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Under Review", "Shortlisted", "Rejected", "Hired"],
            default: "Pending",
        },
        // Application form fields
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        resume: {
            type: String, // File path or URL
            default: "",
        },
        experience: {
            type: String,
            default: "",
        },
        skills: {
            type: String,
            default: "",
        },
        coverLetter: {
            type: String,
            default: "",
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Indexes for efficient querying
applicationSchema.index({ userId: 1, jobId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });

export default mongoose.model("Application", applicationSchema);
