const db = require('../models');

// GET /api/users/me - Get current user with restaurant info
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await db.users.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
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
};

// PUT /api/users/me - Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    
    await req.user.update({
      full_name,
      phone
    });

    const { password_hash, ...userWithoutPassword } = req.user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
