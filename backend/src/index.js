const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // Force reload env vars

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const restaurantAuthRoutes = require('./routes/restaurantAuthRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const menuRoutes = require('./routes/menuRoutes');
const publicRoutes = require('./routes/publicRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Production-ready
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5178'
    ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin: ' + origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use('/api/public', publicRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Restaurant routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/public/restaurants', restaurantRoutes);

// Admin routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

// Restaurant owner routes
app.use('/api/restaurant', restaurantAuthRoutes);
app.use('/api/restaurant', restaurantRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Menu routes
app.use('/api/menu', menuRoutes);

// Category routes
app.use('/api/restaurant/categories', categoryRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FastFood API is running'
  });
});

// Start server with Socket.IO
const http = require('http');
const httpServer = http.createServer(app);

// Initialize Socket.IO
const { initializeSocketIO } = require('./socket/socketServer');
initializeSocketIO(httpServer);

httpServer.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('User App: http://localhost:5173');
  console.log('Restaurant App: http://localhost:5175');
  console.log('Admin App: http://localhost:5174');
  console.log('Socket.IO: ws://localhost:' + PORT);
});

module.exports = { app, httpServer };