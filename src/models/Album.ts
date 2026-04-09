import mongoose, { Schema } from 'mongoose';
import { IAlbum } from '../types';

const albumSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'Album title is required'],
        trim: true
    },
    coverImage: {
        type: String,
        default: ''
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IAlbum>('Album', albumSchema);
