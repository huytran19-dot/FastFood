const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const db = require('./models');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const restaurantAuthRoutes = require('./routes/restaurantAuthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fastfood-secret-key-change-in-production';

// CORS Configuration - Production-ready
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

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

// ===== ROUTES =====
app.use('/api/admin', adminAuthRoutes);
app.use('/api/restaurant', restaurantAuthRoutes);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.users.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: db.roles,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Role Middleware
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role?.name || req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
  };
};

// ===== AUTH ROUTES =====

// POST /api/auth/login - Login for all users
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.users.findOne({ 
      where: { email },
      include: [{
        model: db.roles,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user.toJSON();

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/auth/signup-user - Register customer
app.post('/api/auth/signup-user', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await db.users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Get user role ID
    const userRole = await db.roles.findOne({ where: { name: 'user' } });
    if (!userRole) {
      return res.status(500).json({ message: 'Role không tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.users.create({
      full_name: name,
      email,
      phone,
      password_hash: hashedPassword,
      role_id: userRole.id
    });

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user.toJSON();
    userWithoutPassword.role = userRole;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/auth/signup-owner - Register restaurant owner
app.post('/api/auth/signup-owner', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await db.users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Get restaurant role ID
    const ownerRole = await db.roles.findOne({ where: { name: 'restaurant' } });
    if (!ownerRole) {
      return res.status(500).json({ message: 'Role không tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.users.create({
      full_name: name,
      email,
      phone,
      password_hash: hashedPassword,
      role_id: ownerRole.id
    });

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user.toJSON();
    userWithoutPassword.role = ownerRole;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup owner error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== USER ROUTES =====

// GET /api/users/me - Get current user with restaurant info
app.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.users.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    // If user is owner, include restaurant info
    let userData = user.toJSON();
    if (user.owner_restaurants && user.owner_restaurants.length > 0) {
      userData.restaurant = user.owner_restaurants[0];
    }

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== RESTAURANT ROUTES =====

// POST /api/restaurants - Create new restaurant
app.post('/api/restaurants', authMiddleware, roleMiddleware(['restaurant']), async (req, res) => {
  try {
    const { name, address, phone, description, image_url, operating_hours } = req.body;

    // Check if owner already has a restaurant
    const existingRestaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (existingRestaurant) {
      return res.status(400).json({ message: 'Bạn đã có nhà hàng' });
    }

    // Create restaurant
    const restaurant = await db.restaurants.create({
      name,
      description,
      owner_id: req.user.id,
      review_status: 'PENDING',
      address,
      phone,
      image_url,
      operating_hours: operating_hours || '08:00-22:00'
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/restaurants/mine - Get owner's restaurant
app.get('/api/restaurants/mine', authMiddleware, roleMiddleware(['restaurant']), async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/public/restaurants - Get approved restaurants (for customers)
app.get('/api/public/restaurants', async (req, res) => {
  try {
    const restaurants = await db.restaurants.findAll({
      where: { review_status: 'APPROVED' }
    });

    res.json(restaurants);
  } catch (error) {
    console.error('Get public restaurants error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== ADMIN ROUTES =====

// GET /api/admin/restaurants - Get restaurants by status (admin only)
app.get('/api/admin/restaurants', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { review_status } = req.query;

    const where = {};
    if (review_status) {
      where.review_status = review_status;
    }

    const restaurants = await db.restaurants.findAll({
      where,
      include: [{
        model: db.users,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone'],
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(restaurants);
  } catch (error) {
    console.error('Get admin restaurants error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/admin/restaurants/:id/approve - Approve restaurant
app.post('/api/admin/restaurants/:id/approve', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const restaurant = await db.restaurants.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    await restaurant.update({
      review_status: 'APPROVED',
      approved_at: new Date(),
      approved_by: req.user.id
    });

    res.json({
      message: 'Duyệt nhà hàng thành công',
      restaurant
    });
  } catch (error) {
    console.error('Approve restaurant error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/admin/restaurants/:id/reject - Reject restaurant
app.post('/api/admin/restaurants/:id/reject', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { reason } = req.body;

    const restaurant = await db.restaurants.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    await restaurant.update({
      review_status: 'REJECTED',
      rejection_reason: reason,
      approved_at: new Date(),
      approved_by: req.user.id
    });

    res.json({
      message: 'Từ chối nhà hàng thành công',
      restaurant
    });
  } catch (error) {
    console.error('Reject restaurant error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

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
