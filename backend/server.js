import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import bookingRoutes from './routes/bookings.js';
import chatRoutes from './routes/chats.js';
import referralRoutes from './routes/referrals.js';

// Import socket handlers
import { registerChatHandlers } from './sockets/chatHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for MVP / local testing convenience
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve Static Frontend UI files from project root
app.use(express.static(path.join(__dirname, '..')));

// Fallback root route to serve marketplace.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'marketplace.html'));
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/referrals', referralRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Student Rental Hub Backend is running' });
});

// Configure Socket.io connections
io.on('connection', (socket) => {
  registerChatHandlers(io, socket);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});

export { app, server, io };
