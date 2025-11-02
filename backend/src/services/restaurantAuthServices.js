const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { users, roles, restaurants } = db;

const restaurantAuthService = {
  async login(email, password) {
    try {
      // Find user with role
      const user = await users.findOne({
        where: { email },
        include: [{
          model: roles,
          as: 'role',
          attributes: ['role_id', 'name']
        }]
      });

      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Check if user is restaurant owner
      if (user.role.name !== 'restaurant') {
        throw new Error('Chỉ chủ nhà hàng mới được đăng nhập vào hệ thống này');
      }

      // Find restaurant owned by this user
      const restaurant = await restaurants.findOne({
        where: { user_id: user.user_id }
      });

      if (!restaurant) {
        throw new Error('Không tìm thấy nhà hàng của bạn');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          email: user.email,
          role: user.role.name,
          restaurant_id: restaurant.restaurant_id
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Return user data without password
      const userData = {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role.name,
        restaurant_id: restaurant.restaurant_id
      };

      const restaurantData = {
        restaurant_id: restaurant.restaurant_id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        review_status: restaurant.review_status,
        status: restaurant.status
      };

      return {
        token,
        user: userData,
        restaurant: restaurantData
      };
    } catch (error) {
      console.error('Restaurant auth service error:', error);
      throw error;
    }
  }
};

module.exports = restaurantAuthService;
