import { Server, Socket } from 'socket.io';
import * as roomService from '../services/roomService';
import { ServerToClientEvents, ClientToServerEvents } from '../types';

const socketHandler = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('create_room', () => {
            try {
                const room = roomService.createRoom(socket.id);
                socket.join(room.roomId);
                socket.emit('room_joined', room);
                console.log(`Room created: ${room.roomId} by user: ${socket.id}`);
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('join_room', (roomId: string) => {
            try {
                const room = roomService.joinRoom(roomId, socket.id);
                socket.join(roomId);
                socket.emit('room_joined', room);
                socket.to(roomId).emit('user_joined', { userId: socket.id });
                console.log(`User ${socket.id} joined room: ${roomId}`);
            } catch (err: any) {
                if (err.message === 'Room is full') {
                    socket.emit('room_full', { roomId });
                } else {
                    socket.emit('error', { message: err.message });
                }
            }
        });

        socket.on('play', ({ roomId, currentTime, songId }) => {
            try {
                const room = roomService.getRoom(roomId);
                if (room) {
                    roomService.updatePlayback(roomId, { isPlaying: true, currentTime, currentSongId: songId });
                    socket.to(roomId).emit('sync_play', { currentTime, songId });
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('pause', ({ roomId, currentTime }) => {
            try {
                const room = roomService.getRoom(roomId);
                if (room) {
                    roomService.updatePlayback(roomId, { isPlaying: false, currentTime });
                    socket.to(roomId).emit('sync_pause', { currentTime });
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('seek', ({ roomId, currentTime }) => {
            try {
                const room = roomService.getRoom(roomId);
                if (room) {
                    roomService.updatePlayback(roomId, { currentTime });
                    socket.to(roomId).emit('sync_seek', { currentTime });
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('disconnecting', () => {
            socket.rooms.forEach(roomId => {
                if (roomId !== socket.id) {
                    roomService.leaveRoom(roomId, socket.id);
                    socket.to(roomId).emit('user_left', { userId: socket.id });
                }
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

export default socketHandler;
