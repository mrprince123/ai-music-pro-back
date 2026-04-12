import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
    }

    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

