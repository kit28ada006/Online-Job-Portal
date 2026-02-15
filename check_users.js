import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobportal");
    console.log("Connected to DB");

    const nullUsers = await User.find({ username: null });
    console.log("Users with null username:", nullUsers.length);
    if (nullUsers.length > 0) {
        console.log("IDs:", nullUsers.map(u => u._id));
    }

    const missingUsernameUsers = await User.find({ username: { $exists: false } });
    console.log("Users without username field:", missingUsernameUsers.length);

    const collection = mongoose.connection.collection("users");
    const indexes = await collection.indexes();
    console.log("Indexes:", JSON.stringify(indexes, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
};

run();
