import mongoose from 'mongoose';
import User from './models/User.js';
import Application from './models/Application.js';
import ActivityLog from './models/ActivityLog.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:127.0.0.1:27017/job-portal';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const usersCount = await User.countDocuments({ appliedJobs: { $exists: true, $not: { $size: 0 } } });
        const appsCount = await Application.countDocuments();
        const logsCount = await ActivityLog.countDocuments();

        console.log('Users with applications (old format):', usersCount);
        console.log('Total Applications (new format):', appsCount);
        console.log('Total Activity Logs:', logsCount);

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
