import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true }, // <-- Added
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    contact: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    location: { type: String, default: "" }, // Legacy field
    expectedSalary: { type: String, default: "" },
    experience: { type: String, default: "" },
    jobRole: { type: String, default: "" },
    education: { type: String, default: "" },
    about: { type: String, default: "" },

    // Admin specific fields
    companyName: { type: String, default: "" },
    designation: { type: String, default: "" },
    website: { type: String, default: "" },

    // Social & Professional
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    certifications: { type: [String], default: [] },

    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },

    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

