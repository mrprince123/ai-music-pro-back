import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';

import connectDB from './config/db';
import songRoutes from './routes/songRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import albumRoutes from './routes/albumRoutes';
import categoryRoutes from './routes/categoryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import carouselRoutes from './routes/carouselRoutes';
import socketHandler from './sockets/socketHandler';
import { errorHandler } from './middleware/errorMiddleware';
import { ClientToServerEvents, ServerToClientEvents } from './types';

// Connect Database
connectDB();

const app: Express = express();
const server: http.Server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    allowEIO3: true // Support for older socket.io clients (Android)
});


// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Static files handling
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Routes
app.use('/songs', songRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/albums', albumRoutes);
app.use('/categories', categoryRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/carousel', carouselRoutes);

// Health check
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Music Streaming TS API is running...' });
});

// Error handling
app.use(errorHandler);

// Socket.io Setup
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
