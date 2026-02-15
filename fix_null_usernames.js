import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const cleanUp = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobportal");
        console.log("Connected to DB");

        // Find and delete users with null or missing username
        const result = await User.deleteMany({
            $or: [{ username: null }, { username: { $exists: false } }],
        });

        console.log(`Deleted ${result.deletedCount} users with invalid usernames.`);

    } catch (err) {
        console.error("Error during cleanup:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
    }
};

cleanUp();
