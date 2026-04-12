import { Document } from 'mongoose';

export interface ISong extends Document {
    songName: string;
    description?: string;
    thumbnailUrl: string;
    songUrl: string;
    singerName: string;
    category: string;
    length: number;
    playCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    profilePhoto?: string;
    phoneNumber?: string;
    googleId?: string;
    authProvider: 'email' | 'google' | 'phone';
    role: 'admin' | 'user';
    favorites: string[];
    matchPassword: (password: string) => Promise<boolean>;
}

export interface IUserProfile {
    _id: string;
    name: string;
    profilePhoto?: string;
}

export interface IAlbum extends Document {
    title: string;
    coverImage?: string;
    userId: string;
    songs: string[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPlaybackState {
    isPlaying: boolean;
    currentTime: number;
    lastSyncTime: number;
}

export interface IRoom {
    roomId: string;
    hostId: string; // The user who created the room
    users: string[]; 
    participants: IUserProfile[];
    queue: string[]; // List of song IDs in the queue
    currentSongId: string | null;
    playbackState: IPlaybackState;
}

export interface ServerToClientEvents {
    room_joined: (room: IRoom) => void;
    room_full: (data: { roomId: string }) => void;
    user_joined: (data: { userId: string; name: string; profilePhoto?: string }) => void;
    user_left: (data: { userId: string }) => void;
    user_kicked: (data: { userId: string }) => void;
    queue_updated: (data: { queue: string[] }) => void;
    sync_play: (data: { currentTime: number; songId: string }) => void;
    sync_pause: (data: { currentTime: number }) => void;
    sync_seek: (data: { currentTime: number }) => void;
    room_state: (room: IRoom) => void;
    error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
    create_room: () => void;
    join_room: (roomId: string) => void;
    get_room_state: (data: { roomId: string }) => void;
    request_song: (data: { roomId: string; songId: string }) => void;
    remove_queue_item: (data: { roomId: string; songId: string }) => void;
    change_song: (data: { roomId: string; songId: string }) => void;
    kick_user: (data: { roomId: string; targetUserId: string }) => void;
    play: (data: { roomId: string; currentTime: number; songId: string }) => void;
    pause: (data: { roomId: string; currentTime: number }) => void;
    seek: (data: { roomId: string; currentTime: number }) => void;
}
