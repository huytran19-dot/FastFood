const orderService = require('../services/orderServices');
const cartService = require('../services/cartServices');
const droneService = require('../services/droneServices');
const { emitOrderUpdate } = require('../socket/socketServer');

class OrderController {
  // Tạo đơn hàng mới
  async createOrder(req, res) {
    try {
      const {
        restaurant_id,
        delivery_address,
        delivery_phone,
        delivery_name,
        note,
        payment_method
      } = req.body;

      // Validate
      if (!restaurant_id || !delivery_address || !delivery_phone || !delivery_name) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin giao hàng'
        });
      }

      if (!payment_method || payment_method !== 'COD') {
        return res.status(400).json({
          success: false,
          message: 'Phương thức thanh toán không hợp lệ. Hiện chỉ hỗ trợ COD'
        });
      }

      // Lấy giỏ hàng
      const cart = await cartService.getOrCreateCart(req.user.id);
      
      if (!cart.cart_items || cart.cart_items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Giỏ hàng trống'
        });
      }

      // Tính tổng tiền
      const total_price = cart.cart_items.reduce((sum, item) => {
        return sum + (parseFloat(item.item?.price || 0) * item.quantity);
      }, 0);

      const delivery_fee = 15000;

      // Chuẩn bị dữ liệu order items
      const items = cart.cart_items.map(item => ({
        menu_item_id: item.item_id,
        quantity: item.quantity,
        price: item.item?.price || 0,
        note: item.note
      }));

      // Tạo đơn hàng
      const { order, payment } = await orderService.createOrder(req.user.id, {
        restaurant_id,
        items,
        delivery_address,
        delivery_phone,
        delivery_name,
        note,
        payment_method,
        total_price,
        delivery_fee
      });

      // Clear giỏ hàng sau khi tạo đơn thành công
      await cartService.clearCart(req.user.id);

      // Emit socket event for new order
      emitOrderUpdate(order.id, {
        status: order.status,
        message: 'Đơn hàng mới đã được tạo',
        customerId: req.user.id
      });

      // Chỉ hỗ trợ COD
      if (payment_method === 'COD') {
        return res.json({
          success: true,
          message: 'Đặt hàng thành công',
          data: {
            order_id: order.id,
            status: order.status,
            total: total_price + delivery_fee,
            payment_method: 'COD'
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Phương thức thanh toán không được hỗ trợ'
      });

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo đơn hàng',
        error: error.message
      });
    }
  }

  // Lấy danh sách đơn hàng
  async getOrders(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      const result = await orderService.getOrdersByUser(
        req.user.id,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: {
          total: result.total,
          orders: result.orders.map(order => ({
            id: order.id,
            restaurant: {
              id: order.restaurant?.id,
              name: order.restaurant?.name
            },
            total_price: parseFloat(order.total_price),
            delivery_address: order.delivery_address,
            status: order.status,
            payment_method: order.payment?.method,
            payment_status: order.payment?.status,
            items_count: order.order_items?.length || 0,
            created_at: order.created_at
          }))
        }
      });

    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng'
      });
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id, req.user.id);

      // Parse delivery address coordinates (format: "address, lat, lng")
      let deliveryLat = null;
      let deliveryLng = null;
      
      if (order.delivery_address) {
        const parts = order.delivery_address.split(',');
        
        if (parts.length >= 2) {
          const lat = parseFloat(parts[parts.length - 2].trim());
          const lng = parseFloat(parts[parts.length - 1].trim());
          
          // Validate coordinates
          if (!isNaN(lat) && !isNaN(lng) && 
              lat >= -90 && lat <= 90 && 
              lng >= -180 && lng <= 180) {
            deliveryLat = lat;
            deliveryLng = lng;
          }
        }
      }

      const responseData = {
        id: order.id,
        restaurant: {
          id: order.restaurant?.id,
          name: order.restaurant?.name,
          address: order.restaurant?.address,
          phone: order.restaurant?.phone,
          lat: order.restaurant?.lat ? parseFloat(order.restaurant.lat) : null,
          lng: order.restaurant?.lng ? parseFloat(order.restaurant.lng) : null
        },
        items: order.order_items.map(item => ({
          id: item.id,
          menu_item_id: item.item_id,
          name: item.item?.name,
          description: item.item?.description,
          price: parseFloat(item.price),
          quantity: item.quantity,
          image: item.item?.image_url,
          subtotal: parseFloat(item.price) * item.quantity
        })),
        delivery: {
          address: order.delivery_address,
          phone: order.delivery_phone,
          name: order.delivery_name,
          fee: parseFloat(order.delivery_fee || 15000)
        },
        delivery_address_detail: deliveryLat && deliveryLng ? {
          lat: deliveryLat,
          lng: deliveryLng
        } : null,
        drone_id: order.drone_id,
        note: order.note,
        total_price: parseFloat(order.total_price),
        status: order.status,
        payment: {
          method: order.payment?.method,
          status: order.payment?.status,
          amount: parseFloat(order.payment?.amount || 0)
        },
        created_at: order.created_at,
        updated_at: order.updated_at,
        estimatedTime: '20-30 phút'
      };

      res.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error('Get order detail error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy chi tiết đơn hàng'
      });
    }
  }

  // Cập nhật trạng thái đơn hàng (cho admin/restaurant)
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu trạng thái mới'
        });
      }

      // Không cần userId nếu là admin/restaurant owner
      const order = await orderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        message: 'Đã cập nhật trạng thái đơn hàng',
        data: {
          id: order.id,
          status: order.status,
          payment_status: order.payment?.status
        }
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật trạng thái đơn hàng'
      });
    }
  }

  // Hủy đơn hàng
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.cancelOrder(id, req.user.id);

      res.json({
        success: true,
        message: 'Đã hủy đơn hàng',
        data: {
          id: order.id,
          status: order.status
        }
      });

    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi hủy đơn hàng'
      });
    }
  }

  // Xác nhận nhận hàng bằng OTP
  async confirmDeliveryWithOtp(req, res) {
    try {
      const orderId = req.params.id;
      const { otp } = req.body;

      // Validate input
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mã OTP'
        });
      }

      // Load order for current user
      const order = await orderService.getOrderById(orderId, req.user.id);

      // Validate order exists (getOrderById throws error if not found, but we'll check anyway)
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      // Validate order status - should be DELIVERING (waiting for OTP confirmation)
      if (order.status !== 'DELIVERING') {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng không ở trạng thái chờ xác nhận. Trạng thái hiện tại: ${order.status}`
        });
      }

      // Validate delivery_otp exists
      if (!order.delivery_otp) {
        return res.status(400).json({
          success: false,
          message: 'Đơn hàng không có mã OTP giao hàng'
        });
      }

      // Validate OTP expiration
      if (!order.delivery_otp_expires_at) {
        return res.status(400).json({
          success: false,
          message: 'Mã OTP không có thời gian hết hạn'
        });
      }

      const now = new Date();
      const expiresAt = new Date(order.delivery_otp_expires_at);
      
      if (expiresAt < now) {
        return res.status(400).json({
          success: false,
          message: 'Mã OTP đã hết hạn'
        });
      }

      // Validate OTP matches
      if (order.delivery_otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Mã OTP không đúng'
        });
      }

      // Check if already verified
      if (order.delivery_otp_verified_at) {
        return res.status(400).json({
          success: false,
          message: 'Đơn hàng đã được xác nhận trước đó'
        });
      }

      // All validations passed - update order and payment
      const transaction = await db.sequelize.transaction();

      try {
        // Update order: set verified_at and status to COMPLETED
        await order.update({
          delivery_otp_verified_at: new Date(),
          status: 'COMPLETED'
        }, { transaction });

        // Update payment status to PAID if method is COD
        if (order.payment && order.payment.method === 'COD') {
          await payments.update(
            { status: 'PAID' },
            { 
              where: { order_id: orderId },
              transaction 
            }
          );
        }

        // Optionally update drone status to 'Rảnh' (idle) if drone exists
        if (order.drone_id) {
          try {
            await droneService.updateDroneStatus(order.drone_id, 'Rảnh');
          } catch (droneError) {
            // Log but don't fail the transaction if drone update fails
            console.error(`Error updating drone ${order.drone_id} status:`, droneError);
          }
        }

        await transaction.commit();

        res.json({
          success: true,
          message: 'Xác nhận nhận hàng thành công',
          data: {
            order_id: order.id,
            status: 'COMPLETED'
          }
        });

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Confirm delivery with OTP error:', error);
      
      // Handle specific error from getOrderById
      if (error.message === 'Không tìm thấy đơn hàng') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xác nhận nhận hàng'
      });
    }
  }
}

module.exports = new OrderController();
