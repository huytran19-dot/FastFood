// Restaurant Authentication Controller
// Handles restaurant owner login only
const restaurantAuthService = require('../services/restaurantAuthServices');

class RestaurantAuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email và mật khẩu là bắt buộc'
        });
      }

      const result = await restaurantAuthService.login(email, password);

      // Set cookie with JWT token
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        token: result.token,
        user: result.user,
        restaurant: result.restaurant
      });
    } catch (error) {
      console.error('Restaurant login error:', error);
      res.status(401).json({
        message: error.message || 'Đăng nhập thất bại'
      });
    }
  }
}

module.exports = RestaurantAuthController;
