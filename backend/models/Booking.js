import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lister: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  deposit: {
    type: Number,
    required: true,
    min: 0,
  },
  serviceFee: {
    type: Number,
    required: true,
    min: 0,
  },
  referralDiscountApplied: {
    type: Number,
    default: 0,
    min: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
