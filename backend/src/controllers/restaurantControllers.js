const db = require('../models');
const droneService = require('../services/droneServices');
const droneSimulator = require('../services/droneSimulator');
const { emitOrderUpdate, emitDroneStatusUpdate, emitDroneUpdate, getIO } = require('../socket/socketServer');

// POST /api/restaurants - Create new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, description, image_url, operating_hours, lat, lng } = req.body;

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
    const { name, address, phone, description, image_url, operating_hours, lat, lng } = req.body;

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
    let updateData = { name, address, phone, description, image_url, lat, lng };
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
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

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

// ===== RESTAURANT ORDERS MANAGEMENT =====

// GET /api/restaurant/orders - Get all orders for restaurant
exports.getRestaurantOrders = async (req, res) => {
  try {
    // Get restaurant owned by user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const { status } = req.query;
    const where = { restaurant_id: restaurant.id };
    
    // Map frontend status to backend status for filtering
    const frontendToBackendStatus = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'preparing': 'PREPARING',
      'ready': 'READY',
      'delivering': 'DELIVERING',
      'waiting_otp': 'WAITING_OTP',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED'
    };
    
    if (status && status !== 'all') {
      const backendStatus = frontendToBackendStatus[status.toLowerCase()];
      if (backendStatus) {
        where.status = backendStatus;
      }
    }

    const orders = await db.orders.findAll({
      where,
      include: [
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
            attributes: ['id', 'name', 'price', 'image_url']
          }]
        },
        {
          model: db.payments,
          as: 'payment',
          attributes: ['method', 'status']
        },
        {
          model: db.drones,
          as: 'drone',
          attributes: ['id', 'model', 'status'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Map backend status to frontend status
    const statusMap = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'PREPARING': 'preparing',
      'READY': 'ready',
      'DELIVERING': 'delivering',
      'WAITING_OTP': 'waiting_otp',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };

    // Transform orders to match frontend format
    const formattedOrders = orders.map(order => {
      const orderData = order.toJSON();
      
      // Determine display status
      let displayStatus;
      const hasDrone = !!orderData.drone_id;
      
      // Check if drone is returning (order COMPLETED but drone.status is 'returning')
      if (orderData.status === 'COMPLETED' && orderData.drone?.status === 'returning') {
        displayStatus = 'returning';
      } else if (hasDrone && orderData.status === 'CONFIRMED') {
        displayStatus = 'assigned';
      } else {
        displayStatus = statusMap[orderData.status] || orderData.status.toLowerCase();
      }
      
      // Use displayStatus (already in lowercase format) for frontend compatibility
      
      return {
        id: orderData.id,
        status: displayStatus, // Use lowercase status for frontend
        total_amount: parseFloat(orderData.total_price), // snake_case
        totalAmount: parseFloat(orderData.total_price), // camelCase alias
        order_time: orderData.created_at, // snake_case
        orderTime: orderData.created_at, // camelCase alias
        delivery_time: orderData.status === 'DELIVERING' ? orderData.updated_at : null,
        deliveryTime: orderData.status === 'DELIVERING' ? orderData.updated_at : null,
        completed_time: orderData.status === 'COMPLETED' ? orderData.updated_at : null,
        completedTime: orderData.status === 'COMPLETED' ? orderData.updated_at : null,
        customer_name: orderData.delivery_name || orderData.customer?.full_name || 'N/A', // snake_case
        customerName: orderData.delivery_name || orderData.customer?.full_name || 'N/A', // camelCase alias
        customer_phone: orderData.delivery_phone || orderData.customer?.phone || 'N/A', // snake_case
        customerPhone: orderData.delivery_phone || orderData.customer?.phone || 'N/A', // camelCase alias
        customer_address: orderData.delivery_address, // snake_case
        customerAddress: orderData.delivery_address, // camelCase alias
        deliveryAddress: orderData.delivery_address, // Alias for compatibility
        note: orderData.note,
        items: orderData.order_items?.map(item => ({
          id: item.item?.id,
          name: item.item?.name || 'Món đã bị xóa',
          price: parseFloat(item.price),
          quantity: item.quantity,
          image_url: item.item?.image_url
        })) || [],
        payment_method: orderData.payment?.method,
        payment_status: orderData.payment?.status,
        drone_id: orderData.drone_id,
        drone_model: orderData.drone?.model || null,
        delivery_otp: orderData.delivery_otp || null
      };
    });

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Get restaurant orders error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/restaurant/orders/:id - Get order detail
exports.getRestaurantOrderDetail = async (req, res) => {
  try {
    // Get restaurant owned by user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const order = await db.orders.findOne({
      where: {
        id: req.params.id,
        restaurant_id: restaurant.id
      },
      include: [
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
            attributes: ['id', 'name', 'price', 'image_url', 'description']
          }]
        },
        {
          model: db.payments,
          as: 'payment',
          attributes: ['method', 'status', 'transaction_no', 'created_at']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Map backend status to frontend status
    const statusMap = {
      'PENDING': 'pending',
      'CONFIRMED': 'ready',
      'PREPARING': 'preparing',
      'DELIVERING': 'delivering',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };

    const orderData = order.toJSON();
    const formattedOrder = {
      id: orderData.id,
      status: statusMap[orderData.status] || orderData.status.toLowerCase(),
      totalAmount: parseFloat(orderData.total_price),
      orderTime: orderData.created_at,
      deliveryTime: orderData.status === 'DELIVERING' ? orderData.updated_at : null,
      completedTime: orderData.status === 'COMPLETED' ? orderData.updated_at : null,
      customerName: orderData.delivery_name || orderData.customer?.full_name || 'N/A',
      customerPhone: orderData.delivery_phone || orderData.customer?.phone || 'N/A',
      customerAddress: orderData.delivery_address,
      note: orderData.note,
      items: orderData.order_items?.map(item => ({
        id: item.item?.id,
        name: item.item?.name || 'Món đã bị xóa',
        price: parseFloat(item.price),
        quantity: item.quantity,
        image_url: item.item?.image_url,
        description: item.item?.description
      })) || [],
      payment_method: orderData.payment?.method,
      payment_status: orderData.payment?.status,
      delivery_fee: parseFloat(orderData.delivery_fee || 0)
    };

    res.json({ order: formattedOrder });
  } catch (error) {
    console.error('Get restaurant order detail error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/restaurant/orders/:id/status - Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    let { status } = req.body;
    
    // Map frontend status to backend status
    const frontendToBackendStatus = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'preparing': 'PREPARING',
      'ready': 'READY',
      'delivering': 'DELIVERING',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED'
    };
    
    // Convert to lowercase for mapping
    const statusLower = status?.toLowerCase();
    if (frontendToBackendStatus[statusLower]) {
      status = frontendToBackendStatus[statusLower];
    } else {
      // If not in mapping, try uppercase (might already be backend format)
      status = status?.toUpperCase();
    }
    
    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Get restaurant owned by user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    const order = await db.orders.findOne({
      where: {
        id: req.params.id,
        restaurant_id: restaurant.id
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Validate status transition
    // Note: 'status' variable has already been mapped to backend format above (line 542)
    const currentStatus = order.status;
    const newStatus = status; // Use the already mapped status from above
    
    // Define valid transitions
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['READY', 'CANCELLED'],
      'READY': ['DELIVERING', 'CANCELLED'],
      'DELIVERING': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return res.status(400).json({ 
        message: `Không thể chuyển từ ${currentStatus} sang ${newStatus}` 
      });
    }

    await order.update({ status: newStatus });

    // Map backend status back to frontend
    const backendToFrontendStatus = {
      'PENDING': 'PENDING',
      'CONFIRMED': 'CONFIRMED',
      'PREPARING': 'PREPARING',
      'READY': 'READY',
      'DELIVERING': 'DELIVERING',
      'COMPLETED': 'COMPLETED',
      'CANCELLED': 'CANCELLED'
    };

    res.json({
      message: 'Cập nhật trạng thái thành công',
      order: {
        id: order.id,
        status: backendToFrontendStatus[order.status] || order.status
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/restaurant/drones - Get available drones
exports.getAvailableDrones = async (req, res) => {
  try {
    // Get all drones (restaurant_id = null means available for all restaurants)
    const drones = await db.drones.findAll({
      order: [['id', 'ASC']]
    });

    // Return all drones with their actual status from database
    const formattedDrones = drones.map(drone => {
      const droneData = drone.toJSON();
      const status = (droneData.status || 'IDLE').toLowerCase(); // Normalize to lowercase for comparison
      return {
        id: droneData.id, // Use 'id' instead of 'drone_id' for consistency
        model: droneData.model,
        capacity: parseFloat(droneData.capacity),
        battery: parseFloat(droneData.battery),
        status: status.toUpperCase(), // Return uppercase for frontend Badge component
        is_available: status === 'idle'
      };
    });

    console.log(`📡 Returning ${formattedDrones.length} drones:`, formattedDrones);
    res.json({ drones: formattedDrones });
  } catch (error) {
    console.error('Get available drones error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/restaurant/orders/:id/assign-drone - Assign order to drone
exports.assignOrderToDrone = async (req, res) => {
  try {
    const { drone_id } = req.body;
    const { id: order_id } = req.params;

    if (!drone_id) {
      return res.status(400).json({ message: 'Vui lòng chọn drone' });
    }

    // Parse drone_id to integer
    const droneIdInt = parseInt(drone_id);
    if (isNaN(droneIdInt)) {
      return res.status(400).json({ message: 'ID drone không hợp lệ' });
    }

    // Get restaurant of current user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    // Check if order exists and belongs to this restaurant
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

    // Verify order belongs to this restaurant
    if (order.restaurant_id !== restaurant.id) {
      return res.status(403).json({ message: 'Bạn không có quyền gán đơn hàng này' });
    }

    // Check if order is ready for delivery (can assign drone)
    // Order must be in READY status to assign drone
    // READY = Food is prepared and ready for delivery
    if (order.status !== 'READY') {
      return res.status(400).json({ 
        message: `Đơn hàng đang ở trạng thái ${order.status}, không thể gán drone. Chỉ có thể gán khi đơn hàng ở trạng thái READY (Sẵn sàng giao).` 
      });
    }

    // Check if drone exists
    const drone = await db.drones.findByPk(droneIdInt);

    if (!drone) {
      return res.status(404).json({ message: 'Không tìm thấy drone' });
    }

    // Check if drone is already busy (assigned, delivering, waiting_otp, returning)
    // Normalize status to lowercase for comparison
    const droneStatus = (drone.status || 'IDLE').toLowerCase();
    if (droneStatus !== 'idle') {
      return res.status(400).json({ 
        message: `Drone ${drone.model} đang bận (${drone.status}). Vui lòng chọn drone khác có trạng thái "Rảnh".` 
      });
    }

    // Check if order already has a delivery
    const existingDelivery = await db.deliveries.findOne({
      where: { order_id }
    });

    if (existingDelivery) {
      // Update existing delivery
      await existingDelivery.update({
        drone_id: droneIdInt,
        status: 'ASSIGNED',
        start_location: order.restaurant?.address || null
      });
    } else {
      // Create new delivery
      await db.deliveries.create({
        order_id,
        drone_id: droneIdInt,
        status: 'ASSIGNED',
        start_location: order.restaurant?.address || null,
        end_location: order.delivery_address
      });
    }

    // Update order: set drone_id but keep status as CONFIRMED (đã gán đơn)
    await order.update({ 
      drone_id: droneIdInt
      // Keep status as CONFIRMED, don't change to DELIVERING
    });

    // Update drone status to 'assigned'
    await drone.update({ status: 'assigned' });

    // Emit socket event for real-time update
    emitOrderUpdate(order_id, {
      status: order.status,
      drone_id: droneIdInt.toString(),
      droneStatus: 'assigned',
      droneModel: drone.model
    });

    // Emit drone status update for real-time drone list refresh
    emitDroneStatusUpdate({
      droneId: droneIdInt,
      status: 'assigned',
      orderId: order_id,
      orderNumber: parseInt(order_id),
      model: drone.model
    });

    res.json({
      message: 'Gán đơn hàng cho drone thành công',
      delivery: {
        order_id,
        drone_id: droneIdInt,
        status: 'ASSIGNED'
      }
    });
  } catch (error) {
    console.error('Assign order to drone error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// POST /api/restaurant/orders/:id/start-delivery - Start drone delivery simulation
exports.startDelivery = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    console.log(`🚁 [START DELIVERY] Order #${orderId} - Request received`);

    // Get restaurant owned by user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      console.log(`❌ [START DELIVERY] Order #${orderId} - Restaurant not found`);
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    console.log(`✅ [START DELIVERY] Order #${orderId} - Restaurant found: ${restaurant.name}`);

    // Get order
    const order = await db.orders.findOne({
      where: {
        id: orderId,
        restaurant_id: restaurant.id
      },
      include: [
        {
          model: db.drones,
          as: 'drone',
          attributes: ['id', 'model']
        }
      ]
    });

    if (!order) {
      console.log(`❌ [START DELIVERY] Order #${orderId} - Order not found`);
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    console.log(`✅ [START DELIVERY] Order #${orderId} - Status: ${order.status}, Drone: ${order.drone_id}`);

    if (!order.drone_id) {
      console.log(`❌ [START DELIVERY] Order #${orderId} - No drone assigned`);
      return res.status(400).json({ message: 'Đơn hàng chưa được gán cho drone' });
    }

    // Check order status - can start delivery from READY or CONFIRMED (after assigned drone)
    const allowedStatuses = ['READY', 'CONFIRMED', 'PREPARING'];
    if (!allowedStatuses.includes(order.status)) {
      console.log(`❌ [START DELIVERY] Order #${orderId} - Invalid status: ${order.status}`);
      return res.status(400).json({ 
        message: `Không thể bắt đầu giao hàng. Đơn hàng đang ở trạng thái ${order.status}. Chỉ có thể giao khi đơn hàng ở trạng thái READY, CONFIRMED hoặc PREPARING.` 
      });
    }

    // Check if simulation is already running
    if (droneSimulator.isSimulationRunning(order.drone_id)) {
      console.log(`❌ [START DELIVERY] Order #${orderId} - Simulation already running`);
      return res.status(400).json({ message: 'Drone đang trong quá trình giao hàng' });
    }

    console.log(`✅ [START DELIVERY] Order #${orderId} - All checks passed, starting simulation...`);

    // Get restaurant coordinates
    if (!restaurant.lat || !restaurant.lng) {
      console.log(`❌ [START DELIVERY] Order #${orderId} - Restaurant missing coordinates`);
      return res.status(400).json({ message: 'Nhà hàng chưa có tọa độ. Vui lòng cập nhật vị trí nhà hàng.' });
    }

    // Parse customer coordinates from delivery_address (format: "address, lat, lng")
    // In production, use geocoding API
    let customerLat, customerLng;
    const addressParts = order.delivery_address.split(',');
    
    if (addressParts.length >= 2) {
      const lastTwo = addressParts.slice(-2);
      const potentialLat = parseFloat(lastTwo[0].trim());
      const potentialLng = parseFloat(lastTwo[1].trim());
      
      if (!isNaN(potentialLat) && !isNaN(potentialLng) && 
          potentialLat >= -90 && potentialLat <= 90 && 
          potentialLng >= -180 && potentialLng <= 180) {
        customerLat = potentialLat;
        customerLng = potentialLng;
      }
    }

    if (!customerLat || !customerLng) {
      // Fallback: use a default location near the restaurant for demo
      const restaurantLat = parseFloat(restaurant.lat);
      const restaurantLng = parseFloat(restaurant.lng);
      
      // Create a destination ~1km away (roughly 0.01 degrees)
      customerLat = restaurantLat + 0.008;
      customerLng = restaurantLng + 0.008;
    }

    const restaurantLat = parseFloat(restaurant.lat);
    const restaurantLng = parseFloat(restaurant.lng);

    // Update drone status to 'delivering'
    const drone = await db.drones.findByPk(order.drone_id);
    if (drone) {
      await drone.update({ status: 'delivering' });
      
      console.log(`✅ [START DELIVERY] Order #${orderId} - Drone updated to 'delivering'`);
      
      // Emit drone status update
      emitDroneStatusUpdate({
        droneId: order.drone_id,
        status: 'delivering',
        orderId: orderId,
        orderNumber: order.id,
        model: drone.model
      });
    }

    console.log(`🚀 [START DELIVERY] Order #${orderId} - Starting simulation...`);
    console.log(`📍 [START DELIVERY] Route: Restaurant(${restaurantLat}, ${restaurantLng}) → Customer(${customerLat}, ${customerLng})`);

    // Generate route points (20 points for smooth animation)
    const routePoints = droneSimulator.generateRoutePoints(
      restaurantLat,
      restaurantLng,
      customerLat,
      customerLng,
      20
    );

    // Start simulation using droneSimulator with OTP and Socket.IO
    await droneSimulator.startDroneSimulation(
      order.drone_id,
      orderId,
      routePoints,
      {
        intervalMs: 1000, // 1 second per step
        saveToDbEvery: 5,
        onUpdate: (updatePayload) => {
          // Emit drone position updates to all clients (including user tracking page)
          emitDroneUpdate(order.drone_id, updatePayload);
          
          // Also emit to order room for customer tracking page
          const io = getIO();
          if (io) {
            io.to(`order:${orderId}`).emit('drone:update', updatePayload);
          }
        }
      }
    );

    console.log(`✅ [START DELIVERY] Order #${orderId} - Simulation started successfully`);

    // Get updated order with OTP
    const updatedOrder = await db.orders.findByPk(orderId, {
      attributes: ['id', 'delivery_otp']
    });

    res.json({
      message: 'Đã bắt đầu giao hàng',
      data: {
        order_id: orderId,
        drone_id: order.drone_id,
        drone_model: order.drone?.model,
        status: 'DELIVERING',
        delivery_otp: updatedOrder?.delivery_otp // Return OTP for display
      }
    });
  } catch (error) {
    console.error('Start delivery error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/restaurant/drones/:id/position - Get real-time drone position
exports.getDronePosition = async (req, res) => {
  try {
    const { id: droneId } = req.params;

    // Get restaurant owned by user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    // Get drone position from Redis
    const position = await droneService.getDronePosition(droneId);

    if (!position) {
      return res.status(404).json({ message: 'Không tìm thấy vị trí drone hoặc drone chưa bắt đầu bay' });
    }

    res.json({
      success: true,
      data: {
        drone_id: parseInt(droneId),
        position: {
          lat: position.lat,
          lng: position.lng,
          status: position.status,
          timestamp: position.ts
        }
      }
    });
  } catch (error) {
    console.error('Get drone position error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/restaurant/orders/:id/distance - Calculate distance from drone to destination
exports.getOrderDistance = async (req, res) => {
  try {
    const { id: orderId } = req.params;

    // Get restaurant owned by user
    const restaurant = await db.restaurants.findOne({
      where: { owner_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    // Get order
    const order = await db.orders.findOne({
      where: {
        id: orderId,
        restaurant_id: restaurant.id
      },
      include: [
        {
          model: db.drones,
          as: 'drone',
          attributes: ['id']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (!order.drone_id) {
      return res.status(400).json({ message: 'Đơn hàng chưa được gán cho drone' });
    }

    // Get current drone position
    const dronePosition = await droneService.getDronePosition(order.drone_id);

    if (!dronePosition) {
      return res.status(404).json({ 
        message: 'Không tìm thấy vị trí drone. Drone có thể chưa bắt đầu bay.' 
      });
    }

    // Get destination coordinates (simplified - use restaurant coordinates as destination for now)
    // In production, geocode delivery_address
    const destLat = restaurant.lat ? parseFloat(restaurant.lat) : null;
    const destLng = restaurant.lng ? parseFloat(restaurant.lng) : null;

    if (!destLat || !destLng) {
      return res.status(400).json({ message: 'Không có tọa độ đích' });
    }

    // Calculate distance
    const distance = calculateDistance(
      dronePosition.lat,
      dronePosition.lng,
      destLat,
      destLng
    );

    res.json({
      success: true,
      data: {
        order_id: orderId,
        drone_id: order.drone_id,
        current_position: {
          lat: dronePosition.lat,
          lng: dronePosition.lng
        },
        destination: {
          lat: destLat,
          lng: destLng,
          address: order.delivery_address
        },
        distance_km: Math.round(distance * 100) / 100, // Round to 2 decimals
        distance_m: Math.round(distance * 1000) // Distance in meters
      }
    });
  } catch (error) {
    console.error('Get order distance error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Helper function to generate route points (simplified)
// In production, use a routing service
function generateRoutePoints(startLat, startLng, deliveryAddress) {
  // Simplified: generate a straight line route with intermediate points
  // In production, use OSRM or Google Directions API to get actual route
  
  // For demo, create a route that goes from restaurant to a point 2km away
  // You should replace this with actual geocoding and routing
  const points = [];
  const numPoints = 20; // Number of intermediate points
  
  // Destination (simplified - in production, geocode deliveryAddress)
  // For now, create a destination 2km northeast of start
  const destLat = startLat + 0.018; // ~2km north
  const destLng = startLng + 0.018; // ~2km east
  
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    const lat = startLat + (destLat - startLat) * ratio;
    const lng = startLng + (destLng - startLng) * ratio;
    points.push({ lat, lng });
  }
  
  return points;
}
