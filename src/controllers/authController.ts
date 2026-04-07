import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

/**
 * @desc Auth user & get token (Login)
 * @route POST /auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '30d' }
            );

            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token
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
 * @desc Logout user
 * @route GET /auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'Logged out successfully' });
};
