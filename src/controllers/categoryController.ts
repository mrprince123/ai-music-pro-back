import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Song from '../models/Song';

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            res.status(400);
            throw new Error('Category name is required');
        }

        const categoryExists = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
        if (categoryExists) {
            res.status(400);
            throw new Error('Category already exists');
        }

        const category = await Category.create({ name, description });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const categoryId = req.params['id'];
        
        const category = await Category.findById(categoryId);
        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }

        // Optional: Check if songs are currently using this category
        const songsUsingCategory = await Song.countDocuments({ category: category.name });
        if (songsUsingCategory > 0) {
            res.status(400);
            throw new Error(`Cannot delete: ${songsUsingCategory} songs are currently utilizing this category.`);
        }

        await category.deleteOne();
        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
};
