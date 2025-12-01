const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'fastfood-secret-key-change-in-production';

// Auth Middleware - Verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Check both Authorization header and cookie
    let token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // Support both userId and user_id in token
    const userId = decoded.userId || decoded.user_id;

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

    // Check if user account is active
    if (user.status !== 1) {
      return res.status(403).json({ 
        message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ admin.',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // If user is restaurant owner, check restaurant status
    if (user.role?.name === 'restaurant') {
      const restaurant = await db.restaurants.findOne({
        where: { owner_id: user.id }
      });

      if (restaurant) {
        // Block access if restaurant is disabled (status = 0)
        if (restaurant.status !== 1) {
          return res.status(403).json({ 
            message: 'Nhà hàng của bạn đã bị vô hiệu hóa. Vui lòng liên hệ admin.',
            code: 'RESTAURANT_DISABLED'
          });
        }

        // Attach restaurant to request for later use
        req.restaurant = restaurant;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [Auth] Error:', error.message);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;
