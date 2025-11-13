const db = require('../models');
const { orders, order_items, payments, menu_items, restaurants } = db;

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

      // Tạo order
      const order = await orders.create({
        customer_id: userId,
        restaurant_id,
        total_price: parseFloat(total_price) + parseFloat(delivery_fee),
        delivery_address,
        delivery_phone,
        delivery_name,
        note,
        delivery_fee,
        status: 'PENDING'
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
          attributes: ['id', 'name', 'address', 'phone']
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
    }

    return payment;
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
