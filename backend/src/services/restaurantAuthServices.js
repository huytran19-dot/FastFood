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
          attributes: ['id', 'name']
        }]
      });

      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Check if user is restaurant owner
      if (user.role.name !== 'restaurant') {
        throw new Error('Chỉ chủ nhà hàng mới được đăng nhập vào hệ thống này');
      }

      // Find restaurant owned by this user
      // Priority: APPROVED > PENDING > REJECTED
      let restaurant = await restaurants.findOne({
        where: { 
          owner_id: user.id,
          review_status: 'APPROVED'
        }
      });

      // If no approved restaurant, check for pending
      if (!restaurant) {
        restaurant = await restaurants.findOne({
          where: { 
            owner_id: user.id,
            review_status: 'PENDING'
          }
        });
      }

      // If no pending, check for rejected
      if (!restaurant) {
        restaurant = await restaurants.findOne({
          where: { 
            owner_id: user.id,
            review_status: 'REJECTED'
          }
        });
      }

      if (!restaurant) {
        throw new Error('Không tìm thấy nhà hàng của bạn');
      }

      // Calculate access status based on user.status + restaurant.review_status + restaurant.status
      let accessStatus = 'FULL_ACCESS';
      let accessMessage = '';
      let allowedRoutes = null;

      if (user.status !== 1) {
        accessStatus = 'ACCOUNT_DISABLED';
        accessMessage = 'Tài khoản của bạn đã bị vô hiệu hóa';
      } else if (restaurant.review_status === 'PENDING') {
        accessStatus = 'PENDING_APPROVAL';
        accessMessage = 'Nhà hàng đang chờ admin duyệt';
        allowedRoutes = ['/waiting-approval', '/profile'];
      } else if (restaurant.review_status === 'REJECTED') {
        accessStatus = 'REJECTED';
        accessMessage = `Nhà hàng bị từ chối: ${restaurant.reject_reason || 'Không đạt yêu cầu'}`;
        allowedRoutes = ['/resubmit', '/profile'];
      } else if (restaurant.status !== 1) {
        accessStatus = 'RESTAURANT_INACTIVE';
        accessMessage = 'Nhà hàng đang tạm ngừng hoạt động';
        allowedRoutes = null; // Vào được tất cả nhưng hiển thị warning
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          user_id: user.id,
          email: user.email,
          role: user.role.name,
          restaurant_id: restaurant.id
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Return user data without password
      const userData = {
        user_id: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        role: user.role.name,
        restaurant_id: restaurant.id
      };

      const restaurantData = {
        restaurant_id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        city: restaurant.city,
        phone: restaurant.phone,
        description: restaurant.description,
        image_url: restaurant.image_url,
        operating_hours: `${restaurant.open_time}-${restaurant.close_time}`,
        review_status: restaurant.review_status,
        status: restaurant.status,
        reject_reason: restaurant.reject_reason,
        // Computed fields for frontend routing
        accessStatus,
        accessMessage,
        allowedRoutes
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
