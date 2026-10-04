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

    // Verify participants using string comparison
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
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

// @desc    Send a message in a conversation thread (REST API + WebSocket broadcast)
// @route   POST /api/chats/conversations/:id/messages
// @access  Private
router.post('/conversations/:id/messages', protect, async (req, res) => {
  const { content, type, metadata } = req.body;
  const conversationId = req.params.id;

  try {
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(401).json({ message: 'Not authorized to send messages in this thread' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content: content.trim(),
      type: type || 'text',
      metadata: metadata || {}
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name');

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    // Broadcast over WebSocket if available
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('new_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
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

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name homeCampus email')
      .populate('associatedListing', 'title pricePerDay imageUrl');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
