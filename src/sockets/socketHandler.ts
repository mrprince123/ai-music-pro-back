import { Server, Socket } from 'socket.io';
import * as roomService from '../services/roomService';
import { ServerToClientEvents, ClientToServerEvents } from '../types';

const socketHandler = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        // Get userId from auth handshake or fallback to socket.id
        const userId = socket.handshake.auth.userId || socket.id;
        console.log(`User connected: ${userId}`);
        
        // Broadcast server time for Android offset calculations
        (socket as any).emit('server_time', { serverTime: roomService.getServerTime() });

        socket.on('create_room', async () => {
            try {
                const room = await roomService.createRoom(userId);
                socket.join(room.roomId);
                socket.emit('room_joined', room);
                console.log(`Room created: ${room.roomId} by user: ${userId}`);
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('join_room', async (roomId: string) => {
            try {
                const room = await roomService.joinRoom(roomId, userId);
                socket.join(roomId);
                socket.emit('room_joined', room);
                
                // Find the profile of the joining user to emit to others
                const profile = room.participants.find(p => p._id === userId);
                if (profile) {
                    socket.to(roomId).emit('user_joined', { 
                        userId: profile._id, 
                        name: profile.name, 
                        profilePhoto: profile.profilePhoto 
                    });
                }
                
                console.log(`User ${userId} joined room: ${roomId}`);
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
                if (room && room.hostId === userId) { // Only host controls
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
                if (room && room.hostId === userId) {
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
                if (room && room.hostId === userId) {
                    roomService.updatePlayback(roomId, { currentTime });
                    socket.to(roomId).emit('sync_seek', { currentTime });
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('request_song', ({ roomId, songId }) => {
            try {
                const queue = roomService.addToQueue(roomId, songId);
                io.to(roomId).emit('queue_updated', { queue });
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('remove_queue_item', ({ roomId, songId }) => {
            try {
                const room = roomService.getRoom(roomId);
                if (room && room.hostId === userId) {
                    const queue = roomService.removeFromQueue(roomId, songId);
                    io.to(roomId).emit('queue_updated', { queue });
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('get_room_state', ({ roomId }) => {
            try {
                const room = roomService.getRoom(roomId);
                if (room) {
                    socket.emit('room_state', room);
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('change_song', ({ roomId, songId }) => {
            try {
                const room = roomService.getRoom(roomId);
                if (room && room.hostId === userId) {
                    roomService.updatePlayback(roomId, { isPlaying: true, currentTime: 0, currentSongId: songId });
                    io.to(roomId).emit('sync_play', { currentTime: 0, songId });
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('kick_user', ({ roomId, targetUserId }) => {
            try {
                const room = roomService.getRoom(roomId);
                if (room && room.hostId === userId) {
                    roomService.leaveRoom(roomId, targetUserId);
                    io.to(roomId).emit('user_kicked', { userId: targetUserId });
                    
                    // Force the kicked user's socket to leave the room
                    const sockets = io.sockets.sockets;
                    sockets.forEach((s) => {
                        const sUserId = s.handshake.auth.userId || s.id;
                        if (sUserId === targetUserId) {
                            s.leave(roomId);
                        }
                    });
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('disconnecting', () => {
            socket.rooms.forEach(roomId => {
                if (roomId !== socket.id) {
                    roomService.leaveRoom(roomId, userId);
                    socket.to(roomId).emit('user_left', { userId });
                }
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
        });
    });
};

export default socketHandler;
