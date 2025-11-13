const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'fastfood-secret-key-change-in-production';

// Auth Middleware - Verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Check both Authorization header and cookie
    let token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    
    console.log('🔐 [Auth] Path:', req.path, 'Token exists:', !!token);
    
    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // Support both userId and user_id in token
    const userId = decoded.userId || decoded.user_id;
    
    console.log('🔐 [Auth] Decoded token:', { userId, role: decoded.role });
    
    const user = await db.users.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: db.roles,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    console.log('🔐 [Auth] User loaded:', { id: user.id, role: user.role?.name });

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [Auth] Error:', error.message);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;
