import mongoose, { Schema, models, model } from 'mongoose';

const StaffSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Staff || model('Staff', StaffSchema);
