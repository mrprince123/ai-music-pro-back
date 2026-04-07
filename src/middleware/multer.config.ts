import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const songDir = 'uploads/songs';
const thumbnailDir = 'uploads/thumbnails';

[songDir, thumbnailDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'song') {
            cb(null, songDir);
        } else if (file.fieldname === 'thumbnail') {
            cb(null, thumbnailDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.fieldname === 'song') {
        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } else if (file.fieldname === 'thumbnail') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

export default upload;
