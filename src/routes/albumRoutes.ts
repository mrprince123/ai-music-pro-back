import express, { Router } from 'express';
import * as albumController from '../controllers/albumController';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/my-albums', protect, albumController.getUserAlbums);
router.post('/', protect, albumController.createAlbum);
router.get('/:id', albumController.getAlbum); // Optional: protect with custom logic in controller
router.put('/:id/songs', protect, albumController.addSongToAlbum);

export default router;
