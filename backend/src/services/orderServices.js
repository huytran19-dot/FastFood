const db = require('../models');
const { orders, order_items, payments, menu_items, restaurants } = db;

// Haversine formula to calculate distance between two coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

class OrderService {
  // Tạo đơn hàng mới
  async createOrder(userId, orderData) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { 
        restaurant_id,
        items, // [{menu_item_id, quantity, price}]
        delivery_address,
        delivery_phone,
        delivery_name,
        note,
        payment_method,
        total_price,
        delivery_fee = 15000
      } = orderData;

      // Validate items
      if (!items || items.length === 0) {
        throw new Error('Đơn hàng phải có ít nhất 1 món');
      }

      // Get restaurant to calculate distance
      const restaurant = await restaurants.findByPk(restaurant_id);
      if (!restaurant) {
        throw new Error('Không tìm thấy nhà hàng');
      }

      // Parse coordinates from delivery_address (format: "address, lat, lng")
      let customerLat = null;
      let customerLng = null;
      let calculatedDistance = null;

      const addressParts = delivery_address.split(',');
      if (addressParts.length >= 2) {
        const lastTwo = addressParts.slice(-2);
        const potentialLat = parseFloat(lastTwo[0].trim());
        const potentialLng = parseFloat(lastTwo[1].trim());
        
        if (!isNaN(potentialLat) && !isNaN(potentialLng) && 
            potentialLat >= -90 && potentialLat <= 90 && 
            potentialLng >= -180 && potentialLng <= 180) {
          customerLat = potentialLat;
          customerLng = potentialLng;

          // Calculate distance if restaurant has coordinates
          if (restaurant.lat && restaurant.lng) {
            calculatedDistance = calculateDistance(
              parseFloat(restaurant.lat),
              parseFloat(restaurant.lng),
              customerLat,
              customerLng
            );
          }
        }
      }

      if (!customerLat || !customerLng) {
        // Could not parse coordinates from delivery_address
      }

      // Tạo order
      // COD: tạo với status CONFIRMED ngay
      // Các phương thức khác: tạo với status PENDING
      const orderStatus = payment_method === 'COD' ? 'CONFIRMED' : 'PENDING';
      
      const order = await orders.create({
        customer_id: userId,
        restaurant_id,
        total_price: parseFloat(total_price) + parseFloat(delivery_fee),
        delivery_address,
        delivery_phone,
        delivery_name,
        note,
        delivery_fee,
        status: orderStatus
      }, { transaction });

      // Tạo order items
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        item_id: item.menu_item_id || item.item_id,
        quantity: item.quantity,
        price: item.price,
        note: item.note || null
      }));

      await order_items.bulkCreate(orderItemsData, { transaction });

      // Tạo payment record
      const payment = await payments.create({
        order_id: order.id,
        amount: parseFloat(total_price) + parseFloat(delivery_fee),
        method: payment_method,
        status: payment_method === 'COD' ? 'PENDING' : 'PENDING'
      }, { transaction });

      await transaction.commit();

      // Load đầy đủ thông tin order
      const fullOrder = await this.getOrderById(order.id, userId);
      
      return {
        order: fullOrder,
        payment
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderById(orderId, userId) {
    const order = await orders.findOne({
      where: { id: orderId, customer_id: userId },
      include: [
        {
          model: order_items,
          as: 'order_items',
          include: [{
            model: menu_items,
            as: 'item',
            attributes: ['id', 'name', 'description', 'price', 'image_url']
          }]
        },
        {
          model: restaurants,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone', 'lat', 'lng']
        },
        {
          model: payments,
          as: 'payment',
          attributes: ['id', 'amount', 'method', 'status']
        }
      ]
    });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    return order;
  }

  // Lấy danh sách đơn hàng của user
  async getOrdersByUser(userId, limit = 20, offset = 0) {
    const { count, rows } = await orders.findAndCountAll({
      where: { customer_id: userId },
      include: [
        {
          model: order_items,
          as: 'order_items',
          include: [{
            model: menu_items,
            as: 'item',
            attributes: ['id', 'name', 'image_url', 'price']
          }]
        },
        {
          model: restaurants,
          as: 'restaurant',
          attributes: ['id', 'name']
        },
        {
          model: payments,
          as: 'payment',
          attributes: ['method', 'status']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return { total: count, orders: rows };
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(orderId, status, transactionNo = null) {
    const payment = await payments.findOne({ where: { order_id: orderId } });
    
    if (!payment) {
      throw new Error('Không tìm thấy thông tin thanh toán');
    }

    payment.status = status;
    if (transactionNo) {
      payment.transaction_no = transactionNo;
    }
    
    await payment.save();

    // Nếu thanh toán thành công, cập nhật trạng thái order
    if (status === 'PAID') {
      await orders.update(
        { status: 'CONFIRMED' },
        { where: { id: orderId } }
      );
      console.log(`✅ Order #${orderId} status updated to CONFIRMED`);
    }

    return payment;
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, newStatus, userId = null) {
    const whereClause = { id: orderId };
    if (userId) {
      whereClause.customer_id = userId;
    }

    const order = await orders.findOne({
      where: whereClause,
      include: [{
        model: payments,
        as: 'payment'
      }]
    });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    // Validate status transition
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Trạng thái không hợp lệ');
    }

    order.status = newStatus;
    await order.save();

    // Nếu order chuyển sang DELIVERED và payment method là COD
    // Tự động cập nhật payment status thành SUCCESS
    if (newStatus === 'DELIVERING' && order.payment && order.payment.method === 'COD') {
      order.payment.status = 'PAID';
      await order.payment.save();
      console.log(`✅ COD Payment #${order.payment.id} marked as PAID for order #${orderId}`);
    }

    return order;
  }

  // Hủy đơn hàng
  async cancelOrder(orderId, userId) {
    const order = await orders.findOne({
      where: { id: orderId, customer_id: userId }
    });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      throw new Error('Không thể hủy đơn hàng đang giao hoặc đã hoàn thành');
    }

    order.status = 'CANCELLED';
    await order.save();

    return order;
  }
}

module.exports = new OrderService();
