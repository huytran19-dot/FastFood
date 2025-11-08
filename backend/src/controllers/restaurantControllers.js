const db = require('../models');

// POST /api/restaurants - Create new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, description, image_url, operating_hours, city } = req.body;

    // Check if owner already has a restaurant
    const existingRestaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (existingRestaurant) {
      return res.status(400).json({ message: 'Bạn đã có nhà hàng' });
    }

    // Parse operating_hours into open_time and close_time
    const hours = operating_hours || '08:00-22:00';
    const [open_time, close_time] = hours.split('-').map(t => t.trim());

    // Create restaurant
    const restaurant = await db.restaurants.create({
      name,
      description,
      owner_id: req.user.id,
      review_status: 'PENDING',
      address,
      city: city || null,
      phone,
      image_url,
      open_time,
      close_time
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/restaurants/mine - Get owner's restaurant
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    // Add combined operating_hours for frontend
    const restaurantData = restaurant.toJSON();
    restaurantData.operating_hours = `${restaurant.open_time}-${restaurant.close_time}`;

    res.json(restaurantData);
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/restaurants/mine - Update owner's restaurant
exports.updateMyRestaurant = async (req, res) => {
  try {
    const { name, address, phone, description, image_url, operating_hours, city } = req.body;

    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    // Parse operating_hours if provided
    let updateData = { name, address, phone, description, image_url, city };
    if (operating_hours) {
      const [open_time, close_time] = operating_hours.split('-').map(t => t.trim());
      updateData.open_time = open_time;
      updateData.close_time = close_time;
    }

    await restaurant.update(updateData);

    // Add combined operating_hours for frontend
    const restaurantData = restaurant.toJSON();
    restaurantData.operating_hours = `${restaurant.open_time}-${restaurant.close_time}`;

    res.json(restaurantData);
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/restaurants/stats - Get restaurant statistics
exports.getRestaurantStats = async (req, res) => {
  try {
    console.log('📊 [Stats] User:', req.user?.id, 'Role:', req.user?.role?.name);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      console.log('❌ [Stats] Restaurant not found for user:', req.user.id);
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }
    
    console.log('✅ [Stats] Found restaurant:', restaurant.id);

    // Use correct model names from db
    const { orders, menuItems } = db;

    // Get total orders
    const totalOrders = await orders.count({
      where: { restaurant_id: restaurant.id }
    });

    // Get pending orders
    const pendingOrders = await orders.count({
      where: { 
        restaurant_id: restaurant.id,
        status: 'PENDING'
      }
    });

    // Get completed orders
    const completedOrders = await orders.count({
      where: { 
        restaurant_id: restaurant.id,
        status: 'COMPLETED'
      }
    });

    // Get cancelled orders
    const cancelledOrders = await orders.count({
      where: { 
        restaurant_id: restaurant.id,
        status: 'CANCELLED'
      }
    });

    // Get total revenue from completed orders
    const revenueResult = await orders.sum('total_price', {
      where: { 
        restaurant_id: restaurant.id,
        status: 'COMPLETED'
      }
    });
    const totalRevenue = revenueResult || 0;

    // Get total menu items
    const totalMenuItems = await menuItems.count({
      where: { restaurant_id: restaurant.id }
    });

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      totalMenuItems
    });
  } catch (error) {
    console.error('Get restaurant stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/public/restaurants - Get approved restaurants (for customers)
exports.getPublicRestaurants = async (req, res) => {
  try {
    const restaurants = await db.restaurants.findAll({
      where: { review_status: 'APPROVED' }
    });

    res.json(restaurants);
  } catch (error) {
    console.error('Get public restaurants error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
