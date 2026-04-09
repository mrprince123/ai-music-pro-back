import express, { Router } from 'express';
import * as userController from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/favorites', protect, userController.getFavorites);
router.post('/favorites/:songId', protect, userController.toggleFavorite);

export default router;
