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
    email: string;
    password: string;
    role: 'admin' | 'user';
    favorites: string[];
    matchPassword: (password: string) => Promise<boolean>;
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
    users: string[];
    currentSongId: string | null;
    playbackState: IPlaybackState;
}

export interface ServerToClientEvents {
    room_joined: (room: IRoom) => void;
    room_full: (data: { roomId: string }) => void;
    user_joined: (data: { userId: string }) => void;
    user_left: (data: { userId: string }) => void;
    sync_play: (data: { currentTime: number; songId: string }) => void;
    sync_pause: (data: { currentTime: number }) => void;
    sync_seek: (data: { currentTime: number }) => void;
    error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
    create_room: () => void;
    join_room: (roomId: string) => void;
    play: (data: { roomId: string; currentTime: number; songId: string }) => void;
    pause: (data: { roomId: string; currentTime: number }) => void;
    seek: (data: { roomId: string; currentTime: number }) => void;
}
