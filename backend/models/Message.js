import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
    enum: ['text', 'meetup_proposal', 'price_proposal'],
  },
  metadata: {
    proposedPrice: {
      type: Number,
      default: null,
    },
    meetupLocation: {
      type: String,
      default: null,
    },
    meetupTime: {
      type: Date,
      default: null,
    }
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
