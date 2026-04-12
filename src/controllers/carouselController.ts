import { Request, Response, NextFunction } from 'express';
import Carousel from '../models/Carousel';
import cloudinary from '../config/cloudinary';

/**
 * @desc Get all carousels
 * @route GET /carousel
 */
export const getCarousels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const carousels = await Carousel.find().sort({ createdAt: -1 });
        res.json(carousels);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Add a new carousel (with Cloudinary image upload)
 * @route POST /carousel
 * @access Admin
 */
export const addCarousel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, link } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const singleFile = req.file as Express.Multer.File | undefined;

        // Support both req.file (single) and req.files (fields)
        let imageUrl = '';
        if (singleFile) {
            imageUrl = singleFile.path; // Cloudinary URL from multer-storage-cloudinary
        } else if (files && files['carousel']) {
            imageUrl = files['carousel'][0]!.path;
        }

        if (!imageUrl) {
            res.status(400);
            throw new Error('Please upload an image for the carousel banner');
        }

        const carousel = await Carousel.create({ image: imageUrl, title, link });
        res.status(201).json(carousel);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc Delete a carousel (also removes from Cloudinary)
 * @route DELETE /carousel/:id
 * @access Admin
 */
export const deleteCarousel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const carousel = await Carousel.findByIdAndDelete(req.params.id);
        if (!carousel) {
            res.status(404);
            throw new Error('Carousel not found');
        }

        // Clean up Cloudinary asset
        if (carousel.image && carousel.image.startsWith('http')) {
            try {
                const parts = carousel.image.split('/');
                const filenameWithExt = parts.pop();
                const folder2 = parts.pop();
                const folder1 = parts.pop();
                if (filenameWithExt && folder1 && folder2) {
                    const publicId = `${folder1}/${folder2}/${filenameWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                }
            } catch (err) {
                console.error('Error deleting carousel from Cloudinary:', err);
            }
        }

        res.json({ message: 'Carousel removed' });
    } catch (error) {
        next(error);
    }
};
