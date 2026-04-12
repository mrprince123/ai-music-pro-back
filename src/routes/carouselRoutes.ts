import express from 'express';
import { getCarousels, addCarousel, deleteCarousel } from '../controllers/carouselController';
import { protect, admin } from '../middleware/authMiddleware';
import upload from '../middleware/multer.config';

const router = express.Router();

router.get('/', getCarousels);
router.post('/', protect, admin, upload.single('carousel'), addCarousel);
router.delete('/:id', protect, admin, deleteCarousel);

export default router;
