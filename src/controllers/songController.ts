import { Request, Response, NextFunction } from 'express';
import Song from '../models/Song';
import { streamFile } from '../services/streamService';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary';

/**
 * @desc Get all songs with pagination and category filter
 * @route GET /songs
 */
export const getSongs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = req.query.category as string | undefined;
        const page = parseInt(req.query.page as string || '1', 10);
        const limit = parseInt(req.query.limit as string || '10', 10);
        
        const query = category ? { category } : {};
        
        const songs = await Song.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Song.countDocuments(query);

        res.status(200).json({
            songs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Get single song
 * @route GET /songs/:id
 */
export const getSong = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const song = await Song.findById(req.params['id']);
        if (!song) {
            res.status(404);
            throw new Error('Song not found');
        }
        res.status(200).json(song);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Upload song
 * @route POST /songs/upload
 */
export const uploadSong = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { songName, description, singerName, category, lyrics } = req.body;
        
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        
        if (!files || !files['song'] || !files['thumbnail']) {
            res.status(400);
            throw new Error('Please upload both mp3 and thumbnail!');
        }

        const songFile = files['song'][0]!;
        const thumbnailFile = files['thumbnail'][0]!;

        const song = await Song.create({
            songName,
            description,
            singerName,
            category,
            lyrics,
            songUrl: songFile.path,
            thumbnailUrl: thumbnailFile.path,
        });

        res.status(201).json(song);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Stream song
 * @route GET /songs/stream/:filename
 */
export const streamSong = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filename = req.params['filename'];
        if (!filename || typeof filename !== 'string') {
            res.status(400);
            throw new Error('Valid filename is required');
        }

        // 1. Sanitize filename to prevent path traversal
        const sanitizedFilename = path.basename(filename);

        // 2. Try to find the song to check if it's a remote URL
        const song = await Song.findOne({ 
            songUrl: { $regex: sanitizedFilename, $options: 'i' } 
        });

        if (song && song.songUrl.startsWith('http')) {
            res.redirect(song.songUrl);
            return;
        }

        // 3. Serve local file securely
        // Using common subdirectories if they exist, or base uploads
        const possiblePaths = [
            path.join(__dirname, '../../uploads/songs', sanitizedFilename),
            path.join(__dirname, '../../uploads', sanitizedFilename)
        ];

        let filePath = '';
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                filePath = p;
                break;
            }
        }

        if (!filePath) {
            res.status(404);
            throw new Error('Song file not found');
        }

        streamFile(filePath, req, res);

    } catch (error) {
        next(error);
    }
};

/**
 * @desc Update song
 * @route PUT /songs/:id
 */
export const updateSong = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { songName, description, singerName, category, lyrics } = req.body;
        const song = await Song.findById(req.params['id']);
        
        if (!song) {
            res.status(404);
            throw new Error('Song not found');
        }

        song.songName = songName || song.songName;
        song.description = description || song.description;
        song.singerName = singerName || song.singerName;
        song.category = category || song.category;
        song.lyrics = lyrics !== undefined ? lyrics : song.lyrics;

        // If new files were uploaded, update the URLs
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        
        const deleteCloudinaryAsset = async (url: string, resourceType: 'image' | 'video') => {
            if (!url.startsWith('http')) return;
            // extract 'music-app/songs/...id' from 'https://res.cloudinary.com/.../upload/v1/.../music-app/songs/someid.mp3'
            try {
                const parts = url.split('/');
                const filenameWithExt = parts.pop();
                const folder2 = parts.pop();
                const folder1 = parts.pop();
                if (filenameWithExt && folder1 && folder2) {
                    const publicId = `${folder1}/${folder2}/${filenameWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                }
            } catch (err) {
                console.error('Error deleting old cloudinary asset:', err);
            }
        };

        if (files) {
            if (files['song']) {
                if (song.songUrl.startsWith('http')) {
                    await deleteCloudinaryAsset(song.songUrl, 'video');
                } else if (fs.existsSync(song.songUrl)) {
                    fs.unlinkSync(song.songUrl);
                }
                song.songUrl = files['song'][0]!.path;
            }
            if (files['thumbnail']) {
                if (song.thumbnailUrl.startsWith('http')) {
                    await deleteCloudinaryAsset(song.thumbnailUrl, 'image');
                } else if (fs.existsSync(song.thumbnailUrl)) {
                    fs.unlinkSync(song.thumbnailUrl);
                }
                song.thumbnailUrl = files['thumbnail'][0]!.path;
            }
        }

        const updatedSong = await song.save();
        res.status(200).json(updatedSong);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Delete song
 * @route DELETE /songs/:id
 */
export const deleteSong = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const song = await Song.findById(req.params['id']);
        if (!song) {
            res.status(404);
            throw new Error('Song not found');
        }

        const deleteCloudinaryAsset = async (url: string, resourceType: 'image' | 'video') => {
            if (!url.startsWith('http')) return;
            try {
                const parts = url.split('/');
                const filenameWithExt = parts.pop();
                const folder2 = parts.pop();
                const folder1 = parts.pop();
                if (filenameWithExt && folder1 && folder2) {
                    const publicId = `${folder1}/${folder2}/${filenameWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                }
            } catch (err) {
                console.error('Error deleting old cloudinary asset:', err);
            }
        };

        if (song.songUrl.startsWith('http')) {
            await deleteCloudinaryAsset(song.songUrl, 'video');
        } else if (fs.existsSync(song.songUrl)) {
            fs.unlinkSync(song.songUrl);
        }
        
        if (song.thumbnailUrl.startsWith('http')) {
            await deleteCloudinaryAsset(song.thumbnailUrl, 'image');
        } else if (fs.existsSync(song.thumbnailUrl)) {
            fs.unlinkSync(song.thumbnailUrl);
        }

        await song.deleteOne();
        res.status(200).json({ message: 'Song removed' });
    } catch (error) {
        next(error);
    }
};
