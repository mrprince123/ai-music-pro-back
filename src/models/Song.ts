import mongoose, { Schema } from 'mongoose';
import { ISong } from '../types';

const songSchema: Schema = new Schema({
    songName: {
        type: String,
        required: [true, 'Song name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        required: [true, 'Thumbnail URL is required']
    },
    songUrl: {
        type: String,
        required: [true, 'Song URL is required']
    },
    singerName: {
        type: String,
        required: [true, 'Singer name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        index: true
    },
    length: {
        type: Number,
        default: 0
    },
    playCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model<ISong>('Song', songSchema);
