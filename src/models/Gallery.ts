import mongoose, { Schema, models, model } from 'mongoose';

const GallerySchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, default: '' },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Gallery || model('Gallery', GallerySchema);
