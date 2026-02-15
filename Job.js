// models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    qualification: { type: String },
    jobAgeRequirement: { type: String },
    salary: { type: String },
    deadline: { type: Date },
    applyLink: { type: String },
    type: { type: String },
    category: {
      type: String,
      enum: [
        "Full-time",
        "Internship",
        "Remote",
        "Design",
        "Marketing",
        "Development",
        "Sales",
        "Finance",
        "HR",
      ],
      default: "Full-time",
    },
    companyLogo: { type: String },
    companyEmail: { type: String },
    companyPhone: { type: String },
    companyWebsite: { type: String },
    companyLinkedIn: { type: String },
    companyAbout: { type: String },
    companyRating: { type: Number, min: 0, max: 5, default: 4 },
    urgent: { type: Boolean, default: false },
    jobType: { type: String, default: "Onsite" },
    featured: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ⚡ IMPORTANT: collection name = "jobs"
export default mongoose.model("Job", jobSchema, "jobs");