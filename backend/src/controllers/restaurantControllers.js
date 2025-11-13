const db = require('../models');

// POST /api/restaurants - Create new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, description, image_url, operating_hours, city, lat, lng } = req.body;

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

    // Validate coordinates if provided
    if ((lat !== undefined || lng !== undefined) && (lat === null || lng === null || lat === '' || lng === '')) {
      return res.status(400).json({ message: 'Vui lòng cung cấp cả lat và lng hoặc bỏ qua cả hai' });
    }

    if (lat !== undefined && (lat < -90 || lat > 90)) {
      return res.status(400).json({ message: 'Latitude phải từ -90 đến 90' });
    }

    if (lng !== undefined && (lng < -180 || lng > 180)) {
      return res.status(400).json({ message: 'Longitude phải từ -180 đến 180' });
    }

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
      close_time,
      lat: lat || null,
      lng: lng || null
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
    
    // Safely create operating_hours only if times exist
    if (restaurant.open_time && restaurant.close_time) {
      restaurantData.operating_hours = `${restaurant.open_time}-${restaurant.close_time}`;
    } else {
      restaurantData.operating_hours = '08:00-22:00'; // Default
    }

    res.json(restaurantData);
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/restaurants/mine - Update owner's restaurant
exports.updateMyRestaurant = async (req, res) => {
  try {
    const { name, address, phone, description, image_url, operating_hours, city, lat, lng } = req.body;

    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    // Validate coordinates if provided
    if ((lat !== undefined || lng !== undefined) && (lat === null || lng === null || lat === '' || lng === '')) {
      return res.status(400).json({ message: 'Vui lòng cung cấp cả lat và lng hoặc bỏ qua cả hai' });
    }

    if (lat !== undefined && (lat < -90 || lat > 90)) {
      return res.status(400).json({ message: 'Latitude phải từ -90 đến 90' });
    }

    if (lng !== undefined && (lng < -180 || lng > 180)) {
      return res.status(400).json({ message: 'Longitude phải từ -180 đến 180' });
    }

    // Parse operating_hours if provided
    let updateData = { name, address, phone, description, image_url, city, lat, lng };
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

    // Debug: Check available models
    console.log('🔍 Available models:', Object.keys(db).filter(k => !['sequelize', 'Sequelize'].includes(k)));

    // Use correct model names from db
    const { orders, menu_items } = db;

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
    const totalMenuItems = await menu_items.count({
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

// GET /api/public/restaurants/nearby - Find restaurants near user location
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Vui lòng cung cấp lat và lng' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    if (isNaN(userLat) || isNaN(userLng) || isNaN(searchRadius)) {
      return res.status(400).json({ message: 'Tọa độ không hợp lệ' });
    }

    if (userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
      return res.status(400).json({ message: 'Tọa độ nằm ngoài phạm vi cho phép' });
    }

    // Get all approved restaurants with coordinates
    const restaurants = await db.restaurants.findAll({
      where: { 
        review_status: 'APPROVED',
        lat: { [db.Sequelize.Op.ne]: null },
        lng: { [db.Sequelize.Op.ne]: null }
      },
      raw: true
    });

    // Calculate distance using Haversine formula
    const restaurantsWithDistance = restaurants.map(restaurant => {
      const distance = calculateDistance(
        userLat, 
        userLng, 
        parseFloat(restaurant.lat), 
        parseFloat(restaurant.lng)
      );

      return {
        ...restaurant,
        distance: Math.round(distance * 100) / 100 // Round to 2 decimals
      };
    });

    // Filter by radius and sort by distance
    const nearbyRestaurants = restaurantsWithDistance
      .filter(r => r.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      userLocation: { lat: userLat, lng: userLng },
      radius: searchRadius,
      count: nearbyRestaurants.length,
      restaurants: nearbyRestaurants
    });
  } catch (error) {
    console.error('Get nearby restaurants error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
