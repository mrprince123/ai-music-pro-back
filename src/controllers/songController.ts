import { Request, Response, NextFunction } from 'express';
import Song from '../models/Song';
import { streamFile } from '../services/streamService';
import path from 'path';
import fs from 'fs';

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
        const { songName, description, singerName, category } = req.body;
        
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
        if (!filename) {
            res.status(400);
            throw new Error('Filename is required');
        }
        const filePath = path.join(__dirname, '../../uploads/songs', filename as string);
        if (!fs.existsSync(filePath)) {
            res.status(404);
            throw new Error('File not found');
        }
        streamFile(filePath, req, res);
    } catch (error) {
        next(error);
    }
};
