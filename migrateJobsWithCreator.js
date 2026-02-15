import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./models/Job.js";
import User from "./models/User.js";

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobportal");
        console.log("✅ MongoDB Connected");

        // Find the first admin
        const admin = await User.findOne({ role: "admin" });
        if (!admin) {
            console.error("❌ No admin found to assign jobs to. Please create an admin first.");
            process.exit(1);
        }

        console.log(`👤 Assigning existing jobs to admin: ${admin.email} (${admin._id})`);

        // Update all jobs that don't have a createdBy field
        const result = await Job.updateMany(
            { createdBy: { $exists: false } },
            { $set: { createdBy: admin._id } }
        );

        console.log(`✅ Migration complete. Updated ${result.modifiedCount} jobs.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
