import express, { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/', protect, analyticsController.getDashboardAnalytics);

export default router;
