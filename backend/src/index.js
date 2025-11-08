const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

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

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Production-ready
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173', // User web app
      'http://localhost:5174', // Admin app (old)
      'http://localhost:5175', // Restaurant app
      'http://localhost:5176', // Admin app (current)
      'http://localhost:5178'  // Admin app (alternate)
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
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

// ===== MOUNT ROUTES =====
// Public routes - MUST be first, no auth required
app.use('/api/public', publicRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Restaurant routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/public/restaurants', restaurantRoutes); // Public restaurants

// Admin routes - IMPORTANT: Mount auth routes BEFORE protected routes
app.use('/api/admin', adminAuthRoutes); // Auth routes (login, register) - no middleware
app.use('/api/admin', adminRoutes); // Protected routes - requires auth + admin role

// Restaurant owner routes - IMPORTANT: Mount auth routes BEFORE protected routes
app.use('/api/restaurant', restaurantAuthRoutes); // Auth routes (login) - no middleware
app.use('/api/restaurant', restaurantRoutes); // Protected routes - requires auth + restaurant role

// Upload routes
app.use('/api/upload', uploadRoutes);

// Menu routes
app.use('/api/menu', menuRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FastFood API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 User App: http://localhost:5173`);
  console.log(`🏪 Restaurant App: http://localhost:5175`);
  console.log(`👨‍💼 Admin App: http://localhost:5174`);
});

module.exports = app;
