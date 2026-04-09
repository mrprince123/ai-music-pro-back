import { v4 as uuidv4 } from 'uuid';
import { IRoom } from '../types';

// Mock room storage
const rooms = new Map<string, IRoom>();

const MAX_USERS = 10;

export const createRoom = (hostId: string): IRoom => {
    const roomId = uuidv4().substring(0, 8);
    const room: IRoom = {
        roomId,
        users: [hostId],
        currentSongId: null,
        playbackState: {
            isPlaying: false,
            currentTime: 0,
            lastSyncTime: Date.now()
        }
    };
    rooms.set(roomId, room);
    return room;
};

export const getServerTime = () => Date.now();

export const getRoom = (roomId: string): IRoom | undefined => rooms.get(roomId);

export const joinRoom = (roomId: string, userId: string): IRoom => {
    const room = rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.users.length >= MAX_USERS) throw new Error('Room is full');
    if (!room.users.includes(userId)) {
        room.users.push(userId);
    }
    return room;
};

export const leaveRoom = (roomId: string, userId: string): void => {
    const room = rooms.get(roomId);
    if (room) {
        room.users = room.users.filter(id => id !== userId);
        if (room.users.length === 0) {
            rooms.delete(roomId);
        }
    }
};

export const updatePlayback = (
    roomId: string,
    data: { isPlaying?: boolean; currentTime?: number; currentSongId?: string }
): IRoom | undefined => {
    const room = rooms.get(roomId);
    if (room) {
        if (data.isPlaying !== undefined) room.playbackState.isPlaying = data.isPlaying;
        if (data.currentTime !== undefined) room.playbackState.currentTime = data.currentTime;
        if (data.currentSongId !== undefined) room.currentSongId = data.currentSongId;
        room.playbackState.lastSyncTime = Date.now();
    }
    return room;
};
