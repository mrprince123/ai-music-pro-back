import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Upload limit reached, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});
