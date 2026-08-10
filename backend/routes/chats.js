import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get conversations of logged-in user
// @route   GET /api/chats/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] }
    })
      .populate('participants', 'name homeCampus')
      .populate('associatedListing', 'title pricePerDay imageUrl')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get messages inside a conversation thread
// @route   GET /api/chats/conversations/:id/messages
// @access  Private
router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify participants
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(401).json({ message: 'Not authorized to view messages in this thread' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    // Mark messages sent by others as read
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user._id }, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create/Open conversation relative to a listing
// @route   POST /api/chats/conversations
// @access  Private
router.post('/conversations', protect, async (req, res) => {
  const { recipientId, listingId } = req.body;

  try {
    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    if (req.user._id.toString() === recipientId) {
      return res.status(400).json({ message: 'You cannot open conversation with yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      associatedListing: listingId || null
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        associatedListing: listingId || null
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
