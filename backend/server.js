import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import bookingRoutes from './routes/bookings.js';
import chatRoutes from './routes/chats.js';
import referralRoutes from './routes/referrals.js';

// Import socket handlers
import { registerChatHandlers } from './sockets/chatHandler.js';
import { seedInitialData } from './config/seed.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB and seed initial data if empty
connectDB().then(() => {
  seedInitialData();
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, '../frontend/dist');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Legacy .html redirects to React routes
app.get('/cart.html', (req, res) => res.redirect('/cart'));
app.get('/marketplace.html', (req, res) => res.redirect('/marketplace'));
app.get('/messages.html', (req, res) => res.redirect('/conversations'));
app.get('/create_listing.html', (req, res) => res.redirect('/create-listing'));
app.get('/referral.html', (req, res) => res.redirect('/referrals'));
app.get('/signup.html', (req, res) => res.redirect('/signup'));
app.get('/verification_pending.html', (req, res) => res.redirect('/verify'));
app.get('/listing_detail_classic.html', (req, res) => res.redirect('/marketplace'));

// Serve Static React Frontend UI files from dist
app.use(express.static(frontendDist));

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

// Fallback wildcard route to serve React app's index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
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
