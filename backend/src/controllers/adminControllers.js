const db = require('../models');
const { getIO } = require('../socket/socketServer');

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
      order: [['id', 'ASC']] // Sort by ID ascending (small to large)
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

    // Emit Socket.IO event to force logout if user is being deactivated
    if (status === 0) {
      const io = getIO();
      if (io) {
        io.emit('user:account-locked', { 
          userId: parseInt(id),
          message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên'
        });
        console.log(`🔒 [ADMIN] Emitted account-locked event for user #${id}`);
      }
    }

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

    // Use Sequelize include to get owner info directly
    const restaurants = await db.restaurants.findAll({
      where,
      include: [{
        model: db.users,
        as: 'owner',
        attributes: ['id', 'full_name', 'email', 'phone'],
        required: false // LEFT JOIN - include restaurants even if owner not found
      }],
      order: [['created_at', 'DESC']]
    });

    // Transform restaurants to include owner info
    const restaurantsWithOwner = restaurants.map(restaurant => {
      const restaurantData = restaurant.toJSON();

      return {
        restaurant_id: restaurantData.id,
        owner_id: restaurantData.owner_id,
        name: restaurantData.name,
        phone: restaurantData.phone,
        address: restaurantData.address,
        review_status: restaurantData.review_status,
        status: restaurantData.status,
        reject_reason: restaurantData.reject_reason, // Fixed: was rejection_reason
        created_at: restaurantData.created_at,
        updated_at: restaurantData.updated_at,
        owner: restaurantData.owner ? {
          id: restaurantData.owner.id,
          full_name: restaurantData.owner.full_name,
          email: restaurantData.owner.email,
          phone: restaurantData.owner.phone
        } : null
      };
    });

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
      reject_reason: reason, // Fixed: was rejection_reason
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

// ===== ORDER MANAGEMENT =====

// GET /api/admin/orders - Get all orders with optional restaurant filter
exports.getAllOrders = async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    
    const where = {};
    if (restaurant_id) {
      where.restaurant_id = parseInt(restaurant_id);
    }

    const orders = await db.orders.findAll({
      where,
      include: [
        {
          model: db.restaurants,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone']
        },
        {
          model: db.users,
          as: 'customer',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: db.order_items,
          as: 'order_items',
          include: [{
            model: db.menu_items,
            as: 'item',
            attributes: ['id', 'name', 'price']
          }]
        },
        {
          model: db.payments,
          as: 'payment',
          attributes: ['method', 'status']
        },
        {
          model: db.deliveries,
          as: 'deliveries',
          include: [{
            model: db.drones,
            as: 'drone',
            attributes: ['id', 'model']
          }],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedOrders = orders.map(order => {
      const orderData = order.toJSON();
      // Get assigned drone from deliveries
      const activeDelivery = (orderData.deliveries || []).find(d => {
        const status = (d.status || '').toUpperCase();
        return status !== 'COMPLETED' && status !== 'CANCELLED' && status !== 'FAILED' && status !== 'DROPPED';
      });
      
      return {
        order_id: orderData.id,
        restaurant_id: orderData.restaurant_id,
        restaurant_name: orderData.restaurant?.name || 'N/A',
        customer_id: orderData.customer_id,
        customer_name: orderData.customer?.full_name || 'N/A',
        total_price: parseFloat(orderData.total_price),
        delivery_address: orderData.delivery_address,
        delivery_phone: orderData.delivery_phone,
        delivery_name: orderData.delivery_name,
        status: orderData.status,
        payment_method: orderData.payment?.method,
        payment_status: orderData.payment?.status,
        assigned_drone: activeDelivery?.drone ? {
          id: activeDelivery.drone.id,
          model: activeDelivery.drone.model
        } : null,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at
      };
    });

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ===== DRONE MANAGEMENT =====

// GET /api/admin/drones - Get all drones with status (idle/busy)
exports.getAllDrones = async (req, res) => {
  try {
    const drones = await db.drones.findAll({
      include: [
        {
          model: db.restaurants,
          as: 'restaurant',
          attributes: ['id', 'name'],
          required: false // LEFT JOIN - include drones even if no restaurant assigned
        },
        {
          model: db.deliveries,
          as: 'deliveries',
          required: false // LEFT JOIN - get all deliveries to check status
        }
      ],
      order: [['id', 'ASC']]
    });

    // Format drones with actual status from database
    const formattedDrones = drones.map(drone => {
      const droneData = drone.toJSON();
      const status = (droneData.status || 'IDLE').toLowerCase(); // Normalize to lowercase for comparison
      
      return {
        drone_id: droneData.id,
        restaurant_id: droneData.restaurant_id,
        restaurant_name: droneData.restaurant?.name || null,
        model: droneData.model,
        capacity: parseFloat(droneData.capacity),
        battery: parseFloat(droneData.battery),
        status: status.toUpperCase(), // Display in uppercase for admin (IDLE, ASSIGNED, DELIVERING, etc.)
        is_available: status === 'idle' // Available only when idle
      };
    });

    res.json({ drones: formattedDrones });
  } catch (error) {
    console.error('Get admin drones error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/admin/drones - Create new drone (no restaurant assignment required)
exports.createDrone = async (req, res) => {
  try {
    const { model, capacity } = req.body;

    if (!model || !capacity) {
      return res.status(400).json({ message: 'Model và capacity là bắt buộc' });
    }

    // Create drone without restaurant_id (null = available for all restaurants)
    // Battery defaults to 100 if not provided
    const drone = await db.drones.create({
      restaurant_id: null, // NULL means available for all restaurants
      model,
      capacity: parseFloat(capacity),
      battery: 100, // Default battery level
      status: 'IDLE'
    });

    res.status(201).json({
      message: 'Thêm drone thành công',
      drone: {
        drone_id: drone.id,
        model: drone.model,
        capacity: drone.capacity,
        battery: drone.battery,
        status: 'IDLE',
        is_available: true
      }
    });
  } catch (error) {
    console.error('Create drone error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/admin/drones/:id - Update drone
exports.updateDrone = async (req, res) => {
  try {
    const { model, capacity, status } = req.body;
    
    const drone = await db.drones.findByPk(req.params.id);
    if (!drone) {
      return res.status(404).json({ message: 'Không tìm thấy drone' });
    }

    const updateData = {};
    if (model !== undefined) updateData.model = model;
    if (capacity !== undefined) updateData.capacity = parseFloat(capacity);
    if (status !== undefined) updateData.status = status;
    // Battery không được update qua API này

    await drone.update(updateData);

    res.json({
      message: 'Cập nhật drone thành công',
      drone
    });
  } catch (error) {
    console.error('Update drone error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// DELETE /api/admin/drones/:id - Delete drone
exports.deleteDrone = async (req, res) => {
  try {
    const drone = await db.drones.findByPk(req.params.id);

    if (!drone) {
      return res.status(404).json({ message: 'Không tìm thấy drone' });
    }

    // Check if drone has active deliveries
    const activeDeliveries = await db.deliveries.findAll({
      where: {
        drone_id: drone.id,
        status: { [db.Sequelize.Op.notIn]: ['COMPLETED', 'CANCELLED', 'FAILED', 'DROPPED'] }
      }
    });

    if (activeDeliveries.length > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa drone đang có đơn hàng đang giao. Vui lòng đợi đơn hàng hoàn thành.' 
      });
    }

    await drone.destroy();

    res.json({
      message: 'Xóa drone thành công'
    });
  } catch (error) {
    console.error('Delete drone error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/admin/orders/:id/assign-drone - Assign order to drone
exports.assignOrderToDrone = async (req, res) => {
  try {
    const { drone_id } = req.body;
    const { id: order_id } = req.params;

    if (!drone_id) {
      return res.status(400).json({ message: 'Vui lòng chọn drone' });
    }

    // Check if order exists
    const order = await db.orders.findByPk(order_id, {
      include: [{
        model: db.restaurants,
        as: 'restaurant',
        attributes: ['id', 'name', 'address', 'lat', 'lng']
      }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check if order is ready for delivery (can assign drone)
    // Can assign when: CONFIRMED, PREPARING (not yet DELIVERING, COMPLETED, CANCELLED)
    if (!['CONFIRMED', 'PREPARING'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Đơn hàng đang ở trạng thái ${order.status}, không thể gán drone. Chỉ có thể gán khi đơn hàng ở trạng thái CONFIRMED hoặc PREPARING.` 
      });
    }

    // Check if drone exists and is available
    const drone = await db.drones.findByPk(drone_id, {
      include: [{
        model: db.deliveries,
        as: 'deliveries',
        where: {
          status: { [db.Sequelize.Op.notIn]: ['COMPLETED', 'CANCELLED', 'FAILED', 'DROPPED'] }
        },
        required: false
      }]
    });

    if (!drone) {
      return res.status(404).json({ message: 'Không tìm thấy drone' });
    }

    // Check if drone is busy
    const activeDeliveries = (drone.deliveries || []).filter(d => {
      const status = (d.status || '').toUpperCase();
      return status !== 'COMPLETED' && status !== 'CANCELLED' && status !== 'FAILED' && status !== 'DROPPED';
    });

    if (activeDeliveries.length > 0) {
      return res.status(400).json({ message: 'Drone đang bận, không thể gán đơn hàng mới' });
    }

    // Check if order already has a delivery
    const existingDelivery = await db.deliveries.findOne({
      where: { order_id }
    });

    if (existingDelivery) {
      // Update existing delivery
      await existingDelivery.update({
        drone_id,
        status: 'ASSIGNED',
        start_location: order.restaurant?.address || null
      });
    } else {
      // Create new delivery
      await db.deliveries.create({
        order_id,
        drone_id,
        status: 'ASSIGNED',
        start_location: order.restaurant?.address || null,
        end_location: order.delivery_address
      });
    }

    // Update order: set drone_id and status to DELIVERING
    await order.update({ 
      drone_id,
      status: 'DELIVERING' 
    });

    res.json({
      message: 'Gán đơn hàng cho drone thành công',
      delivery: {
        order_id,
        drone_id,
        status: 'ASSIGNED'
      }
    });
  } catch (error) {
    console.error('Assign order to drone error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
