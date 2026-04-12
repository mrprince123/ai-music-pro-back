import { v4 as uuidv4 } from 'uuid';
import { IRoom, IUserProfile } from '../types';
import User from '../models/User';

// Mock room storage (in-memory for now)
const rooms = new Map<string, IRoom>();

const MAX_USERS = 10;

const getUserProfile = async (userId: string): Promise<IUserProfile | null> => {
    // If it's a socket.id (not logged in), return a guest profile
    if (userId.startsWith('guest_') || !userId.match(/^[0-9a-fA-F]{24}$/)) {
        return {
            _id: userId,
            name: `Guest ${userId.substring(0, 4)}`,
            profilePhoto: ''
        };
    }

    const user = await User.findById(userId);
    if (!user) return null;
    return {
        _id: user._id.toString(),
        name: user.name,
        profilePhoto: user.profilePhoto
    };
};

export const createRoom = async (hostId: string): Promise<IRoom> => {
    const roomId = uuidv4().substring(0, 8);
    const hostProfile = await getUserProfile(hostId);
    
    const room: IRoom = {
        roomId,
        hostId,
        users: [hostId],
        participants: hostProfile ? [hostProfile] : [],
        queue: [],
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

export const addToQueue = (roomId: string, songId: string): string[] => {
    const room = rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (!room.queue.includes(songId)) {
        room.queue.push(songId);
    }
    return room.queue;
};

export const removeFromQueue = (roomId: string, songId: string): string[] => {
    const room = rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    room.queue = room.queue.filter(id => id !== songId);
    return room.queue;
};

export const joinRoom = async (roomId: string, userId: string): Promise<IRoom> => {
    const room = rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.users.length >= MAX_USERS) throw new Error('Room is full');
    
    if (!room.users.includes(userId)) {
        room.users.push(userId);
        const profile = await getUserProfile(userId);
        if (profile) {
            room.participants.push(profile);
        }
    }
    return room;
};

export const leaveRoom = (roomId: string, userId: string): void => {
    const room = rooms.get(roomId);
    if (room) {
        room.users = room.users.filter(id => id !== userId);
        room.participants = room.participants.filter(p => p._id !== userId);
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
