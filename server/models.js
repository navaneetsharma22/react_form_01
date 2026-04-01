import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    comments: {
      type: String,
      default: '',
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      required: true,
      enum: ['Online', 'Offline'],
    },
    favCar: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

export const Registration =
  mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
