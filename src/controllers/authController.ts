import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d'
    });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please provide all required fields (name, email, password)');
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
            authProvider: 'email'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                authProvider: user.authProvider,
                createdAt: (user as any).createdAt,
                token: generateToken(user._id.toString())
            });

        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Auth user & get token (Login)
 * @route POST /auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && user.authProvider === 'email' && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                authProvider: user.authProvider,
                createdAt: (user as any).createdAt,
                token: generateToken(user._id.toString())
            });

        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Google Login
 * @route POST /auth/google
 */
export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { idToken } = req.body;

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400);
            throw new Error('Invalid Google token');
        }

        const { sub, email, name, picture } = payload;

        let user = await User.findOne({ googleId: sub });

        if (!user) {
            // Check if user exists with same email
            user = await User.findOne({ email });

            if (user) {
                // Link account
                user.googleId = sub;
                user.authProvider = 'google';
                if (!user.profilePhoto) user.profilePhoto = picture;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    name: name || 'Google User',
                    email: email,
                    googleId: sub,
                    profilePhoto: picture,
                    authProvider: 'google'
                });
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto,
            role: user.role,
            authProvider: user.authProvider,
            createdAt: (user as any).createdAt,
            token: generateToken(user._id.toString())
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc Phone Login
 * @route POST /auth/phone
 */
export const phoneLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { phoneNumber, name, profilePhoto } = req.body;

        let user = await User.findOne({ phoneNumber });

        if (!user) {
            user = await User.create({
                name: name || 'Phone User',
                email: `${phoneNumber}@phone.com`, // Dummy email if required by schema
                phoneNumber,
                profilePhoto,
                authProvider: 'phone'
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            profilePhoto: user.profilePhoto,
            role: user.role,
            authProvider: user.authProvider,
            createdAt: (user as any).createdAt,
            token: generateToken(user._id.toString())
        });

    } catch (error) {
        next(error);
    }
};


/**
 * @desc Logout user
 * @route GET /auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'Logged out successfully' });
};
