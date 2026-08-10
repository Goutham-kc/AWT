import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const registerChatHandlers = (io, socket) => {
  console.log(`User connected via socket: ${socket.id}`);

  // User online presence tracker
  socket.on('register_user', async (userId) => {
    socket.userId = userId;
    console.log(`Socket ${socket.id} registered to user ${userId}`);
    // Broadcast user is online
    socket.broadcast.emit('user_presence', { userId, status: 'online' });
  });

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
  });

  // Handle incoming chat messages
  socket.on('send_message', async (data) => {
    const { conversationId, senderId, content, type, metadata } = data;

    try {
      if (!conversationId || !senderId || !content) {
        socket.emit('error', { message: 'Missing conversationId, senderId, or content' });
        return;
      }

      // Save message to database
      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        content,
        type: type || 'text',
        metadata: metadata || {}
      });

      // Populate sender name before sending out
      const populatedMessage = await Message.findById(message._id).populate('sender', 'name');

      // Update conversation last message and updatedAt time
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date()
      });

      // Broadcast to all participants in the conversation room
      io.to(conversationId).emit('new_message', populatedMessage);
      console.log(`Message in conversation ${conversationId} broadcasted successfully`);
    } catch (error) {
      console.error('Error handling send_message socket event:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Handle typing status broadcast
  socket.on('typing_status', (data) => {
    const { conversationId, userId, isTyping } = data;
    socket.to(conversationId).emit('typing_status', { conversationId, userId, isTyping });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.userId) {
      // Broadcast user is offline
      socket.broadcast.emit('user_presence', { userId: socket.userId, status: 'offline' });
    }
  });
};
