import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        let user = await User.findOne({ role: 'admin' });
        if (user) {
            user.password = adminPassword;
            user.email = adminEmail;
            await user.save();
            console.log(`Admin password reset to: ${adminPassword}`);
        } else {
            console.log('No user found');
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
