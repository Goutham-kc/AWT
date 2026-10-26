import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
    trim: true,
  },
  homeCampus: {
    type: String,
    required: false,
    default: 'Main Campus',
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationOTP: {
    type: String,
    default: null,
  },
  otpExpiresAt: {
    type: Date,
    default: null,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // Allows null/empty values before verification
  },
  referredBy: {
    type: String,
    default: null,
  },
  referralCredits: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  completedRentalsAsRenter: {
    type: Number,
    default: 0,
  },
  completedRentalsAsLister: {
    type: Number,
    default: 0,
  },
  positiveRatingsCount: {
    type: Number,
    default: 0,
  },
  totalRatingsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model('User', userSchema);
export default User;
