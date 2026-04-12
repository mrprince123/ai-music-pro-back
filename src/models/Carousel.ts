import mongoose, { Schema, Document } from 'mongoose';

export interface ICarousel extends Document {
    image: string;
    title?: string;
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}

const carouselSchema: Schema = new Schema({
    image: {
        type: String,
        required: [true, 'Carousel image is required']
    },
    title: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model<ICarousel>('Carousel', carouselSchema);
