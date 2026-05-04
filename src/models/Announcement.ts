import mongoose, { Schema, models, model } from 'mongoose';

const AnnouncementSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    isActive: { type: Boolean, default: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Announcement || model('Announcement', AnnouncementSchema);
