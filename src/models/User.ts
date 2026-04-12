import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // Optional because Google/Phone login users won't have a password
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null/undefined values
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ['email', 'google', 'phone'],
        default: 'email'
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (this: any) {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
