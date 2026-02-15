import mongoose from 'mongoose';
import User from './backend/models/User.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const admins = await User.find({ role: 'admin' }).select('-password');
        console.log('--- ADMIN USERS IN DB ---');
        console.log(JSON.stringify(admins, null, 2));
        console.log('-------------------------');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
