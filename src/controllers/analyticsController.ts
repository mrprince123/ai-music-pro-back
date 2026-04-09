import { Request, Response, NextFunction } from 'express';
import Song from '../models/Song';
import User from '../models/User';
import Album from '../models/Album';
import Category from '../models/Category';

export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const totalSongs = await Song.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalAlbums = await Album.countDocuments();
        const totalCategories = await Category.countDocuments();

        const playStats = await Song.aggregate([
            { $group: { _id: null, totalPlays: { $sum: "$playCount" } } }
        ]);
        const totalPlays = playStats.length > 0 ? playStats[0].totalPlays : 0;

        // Get 5 most recently uploaded songs
        const recentUploads = await Song.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('songName singerName createdAt thumbnailUrl');

        // Get distribution of categories
        const categoryDistribution = await Song.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { category: "$_id", count: 1, _id: 0 } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalSongs,
                    totalUsers,
                    totalAlbums,
                    totalCategories,
                    totalPlays
                },
                recentUploads,
                categoryDistribution
            }
        });
    } catch (error) {
        next(error);
    }
};
