import express, { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/', categoryController.getCategories); // Public route for dropdowns
router.post('/', protect, categoryController.createCategory);
router.delete('/:id', protect, categoryController.deleteCategory);

export default router;
