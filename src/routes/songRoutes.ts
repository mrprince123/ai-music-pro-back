import express, { Router } from 'express';
import * as songController from '../controllers/songController';
import upload from '../middleware/multer.config';
import { apiLimiter, uploadLimiter } from '../middleware/rateLimit';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/', apiLimiter, songController.getSongs);
router.get('/:id', apiLimiter, songController.getSong);

router.post('/upload', protect, uploadLimiter, upload.fields([
    { name: 'song', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), songController.uploadSong);

router.get('/stream/:filename', songController.streamSong);

export default router;
