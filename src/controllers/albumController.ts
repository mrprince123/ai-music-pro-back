import { Request, Response, NextFunction } from 'express';
import Album from '../models/Album';
import Song from '../models/Song';

export const createAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?._id;
        const { title, coverImage, isPublic } = req.body;

        if (!userId) {
            res.status(401);
            throw new Error('Not authorized');
        }

        if (!title) {
            res.status(400);
            throw new Error('Title is required');
        }

        const album = await Album.create({
            title,
            coverImage: coverImage || '',
            userId,
            isPublic: isPublic !== undefined ? isPublic : true,
            songs: []
        });

        res.status(201).json({ success: true, data: album });
    } catch (error) {
        next(error);
    }
};

export const getAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const album = await Album.findById(req.params['id']).populate('songs');
        
        if (!album) {
            res.status(404);
            throw new Error('Album not found');
        }

        // If album is private, ensure requester is the owner
        if (!album.isPublic && String(album.userId) !== String((req as any).user?._id)) {
            res.status(403);
            throw new Error('Not authorized to view this album');
        }

        res.status(200).json({ success: true, data: album });
    } catch (error) {
        next(error);
    }
};

export const addSongToAlbum = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?._id;
        const albumId = req.params['id'];
        const { songId } = req.body;

        const album = await Album.findById(albumId);
        if (!album) {
            res.status(404);
            throw new Error('Album not found');
        }

        if (String(album.userId) !== String(userId)) {
            res.status(403);
            throw new Error('You can only modify your own albums');
        }

        const song = await Song.findById(songId);
        if (!song) {
            res.status(404);
            throw new Error('Song not found');
        }

        if (!album.songs.includes(songId)) {
            album.songs.push(songId);
            await album.save();
        }

        res.status(200).json({ success: true, message: 'Song added to album', data: album });
    } catch (error) {
        next(error);
    }
};

export const getUserAlbums = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?._id;
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized');
        }

        const albums = await Album.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: albums.length, data: albums });
    } catch (error) {
        next(error);
    }
};
