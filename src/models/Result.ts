import mongoose, { Schema, models, model } from 'mongoose';

const ResultSchema = new Schema(
  {
    studentName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    class: { type: String, required: true },
    exam: { type: String, required: true },
    subjects: { type: Map, of: Number, default: {} },
    percentage: { type: String, required: true },
    grade: { type: String, required: true },
    published: { type: Boolean, default: false },
    studentUsername: { type: String },
  },
  { timestamps: true }
);

export default models.Result || model('Result', ResultSchema);
