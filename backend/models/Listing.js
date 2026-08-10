import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['textbooks', 'electronics', 'cycles', 'furniture', 'utilities'],
  },
  condition: {
    type: String,
    required: true,
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0,
  },
  deposit: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  campus: {
    type: String,
    required: true,
    trim: true,
  },
  lister: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  allowDirectBooking: {
    type: Boolean,
    default: true,
  },
  availabilityStatus: {
    type: String,
    default: 'available',
    enum: ['available', 'paused', 'booked'],
  },
  blockedDates: [{
    type: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
