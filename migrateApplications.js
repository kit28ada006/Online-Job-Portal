import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Application from "./models/Application.js";

dotenv.config();

const migrateApplications = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobportal"
        );
        console.log("✅ Connected to MongoDB");

        // Find all users (excluding admins) with appliedJobs
        const users = await User.find({
            role: { $ne: "admin" },
            appliedJobs: { $exists: true, $ne: [] },
        });

        console.log(`📊 Found ${users.length} users with applications`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            for (const jobId of user.appliedJobs) {
                // Check if application already exists
                const exists = await Application.findOne({
                    userId: user._id,
                    jobId: jobId,
                });

                if (!exists) {
                    // Create new application document
                    await Application.create({
                        userId: user._id,
                        jobId: jobId,
                        status: "Pending",
                        appliedAt: user.createdAt || new Date(), // Use user creation date as fallback
                    });
                    migratedCount++;
                } else {
                    skippedCount++;
                }
            }
        }

        console.log(`✅ Migration complete!`);
        console.log(`   - Migrated: ${migratedCount} applications`);
        console.log(`   - Skipped: ${skippedCount} existing applications`);

        await mongoose.disconnect();
        console.log("👋 Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Migration error:", err);
        process.exit(1);
    }
};

migrateApplications();
