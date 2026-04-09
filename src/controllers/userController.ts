import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Song from '../models/Song';

/**
 * @desc Get User favorites
 * @route GET /users/favorites
 */
export const getFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?._id; // Requires protect middleware
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized');
        }

        const user = await User.findById(userId).populate({
            path: 'favorites',
            model: 'Song'
        });

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.status(200).json({
            success: true,
            data: user.favorites,
            message: 'Favorites retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Toggle Favorite Song
 * @route POST /users/favorites/:songId
 */
export const toggleFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?._id;
        const songId = String(req.params['songId']);

        if (!userId) {
            res.status(401);
            throw new Error('Not authorized');
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const songExists = await Song.findById(songId);
        if (!songExists) {
            res.status(404);
            throw new Error('Song not found');
        }

        const isFavorite = user.favorites.includes(songId);
        
        if (isFavorite) {
            user.favorites = user.favorites.filter(id => id.toString() !== songId);
        } else {
            user.favorites.push(songId);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
            data: user.favorites
        });
    } catch (error) {
        next(error);
    }
};
