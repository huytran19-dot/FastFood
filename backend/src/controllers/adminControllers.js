const db = require('../models');

// ===== USER MANAGEMENT =====

// GET /api/admin/users - Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await db.users.findAll({
      include: [{
        model: db.roles,
        as: 'role',
        attributes: ['id', 'name']
      }],
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    // Format response to match frontend expectations
    const formattedUsers = allUsers.map(user => ({
      id: user.id, // Frontend expects 'id', not 'user_id'
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: {
        id: user.role?.id,
        name: user.role?.name || 'N/A'
      },
      status: user.status === 1 ? 'active' : 'inactive', // Convert 1/0 to 'active'/'inactive'
      created_at: user.created_at,
      updated_at: user.updated_at
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PATCH /api/admin/users/:id/status - Toggle user status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    // Validate and convert status to integer (0 or 1)
    // Accept: 0, 1, '0', '1', 'active', 'inactive', true, false
    if (status === 'active' || status === true || status === 1 || status === '1') {
      status = 1;
    } else if (status === 'inactive' || status === false || status === 0 || status === '0') {
      status = 0;
    } else {
      return res.status(400).json({ 
        message: 'Trạng thái không hợp lệ. Sử dụng: 0, 1, "active", "inactive"' 
      });
    }

    const user = await db.users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await user.update({ status });

    res.json({ 
      message: `Cập nhật trạng thái thành công: ${status === 1 ? 'Active' : 'Inactive'}`,
      user: {
        ...user.toJSON(),
        statusText: status === 1 ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// DELETE /api/admin/users/:id - Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await user.destroy();

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ===== RESTAURANT MANAGEMENT =====

// GET /api/admin/restaurants - Get all restaurants with owner info
exports.getAllRestaurants = async (req, res) => {
  try {
    const { review_status } = req.query;

    const where = {};
    if (review_status) {
      where.review_status = review_status;
    }

    const restaurants = await db.restaurants.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    // Manually fetch owner info for each restaurant
    const restaurantsWithOwner = await Promise.all(
      restaurants.map(async (restaurant) => {
        const owner = await db.users.findByPk(restaurant.owner_id, {
          attributes: ['id', 'full_name', 'email', 'phone'],
          include: [{
            model: db.roles,
            as: 'role',
            attributes: ['id', 'name']
          }]
        });

        return {
          restaurant_id: restaurant.id,
          owner_id: restaurant.owner_id,
          name: restaurant.name,
          phone: restaurant.phone,
          address: restaurant.address,
          review_status: restaurant.review_status,
          status: restaurant.status,
          reject_reason: restaurant.rejection_reason,
          created_at: restaurant.created_at,
          updated_at: restaurant.updated_at,
          owner: owner ? {
            id: owner.id,
            full_name: owner.full_name,
            email: owner.email,
            phone: owner.phone
          } : null
        };
      })
    );

    res.json({ restaurants: restaurantsWithOwner });
  } catch (error) {
    console.error('Get admin restaurants error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/admin/restaurants/:id/approve - Approve restaurant
exports.approveRestaurant = async (req, res) => {
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
};

// PUT /api/admin/restaurants/:id/reject - Reject restaurant
exports.rejectRestaurant = async (req, res) => {
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
};

// PUT /api/admin/restaurants/:id/toggle-status - Toggle restaurant status
exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const newStatus = restaurant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    await restaurant.update({ status: newStatus });

    res.json({
      message: `Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} nhà hàng`,
      restaurant
    });
  } catch (error) {
    console.error('Toggle restaurant status error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
