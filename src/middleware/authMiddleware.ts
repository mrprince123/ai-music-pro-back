import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { IUser } from '../types';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                res.status(401);
                return next(new Error('Not authorized, no token'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                res.status(401);
                return next(new Error('Not authorized, user not found'));
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        next(new Error('Not authorized as an admin'));
    }
};

