const orderService = require('../services/orderServices');
const cartService = require('../services/cartServices');
const { createVNPayUrl, verifyVNPayReturn, vnpayResponseCodes } = require('../utils/vnpay');

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

      if (!payment_method || !['COD', 'VNPAY', 'MOMO'].includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: 'Phương thức thanh toán không hợp lệ'
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

      // Nếu thanh toán COD, trả về kết quả
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

      // Nếu thanh toán VNPay, tạo URL thanh toán
      if (payment_method === 'VNPAY') {
        const ipAddr = req.headers['x-forwarded-for'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress ||
                       '127.0.0.1';

        const orderInfo = `Thanh toan don hang #${order.id}`;
        const paymentUrl = createVNPayUrl(
          order.id.toString(),
          total_price + delivery_fee,
          ipAddr,
          orderInfo
        );

        return res.json({
          success: true,
          message: 'Đơn hàng đã tạo, chuyển đến trang thanh toán',
          data: {
            order_id: order.id,
            payment_url: paymentUrl,
            payment_method: 'VNPAY'
          }
        });
      }

      // TODO: Xử lý các phương thức thanh toán khác (MOMO, ...)
      return res.json({
        success: true,
        message: 'Đặt hàng thành công',
        data: {
          order_id: order.id,
          status: order.status
        }
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

  // Callback từ VNPay
  async vnpayReturn(req, res) {
    try {
      const vnpParams = req.query;
      
      console.log('===== VNPay Return Params =====');
      console.log(vnpParams);

      // Verify chữ ký
      const isValid = verifyVNPayReturn(vnpParams);
      
      if (!isValid) {
        console.error('❌ Invalid VNPay signature');
        return res.redirect(
          `http://localhost:5173/payment-return?status=error&message=${encodeURIComponent('Chữ ký không hợp lệ')}`
        );
      }

      const orderId = vnpParams.vnp_TxnRef;
      const responseCode = vnpParams.vnp_ResponseCode;
      const transactionNo = vnpParams.vnp_TransactionNo;
      const amount = vnpParams.vnp_Amount / 100; // VNPay trả về amount * 100

      // Kiểm tra kết quả thanh toán
      if (responseCode === '00') {
        // Thanh toán thành công
        await orderService.updatePaymentStatus(orderId, 'PAID', transactionNo);
        
        console.log(`✅ Payment successful for order #${orderId}`);
        
        return res.redirect(
          `http://localhost:5173/payment-return?status=success&orderId=${orderId}&amount=${amount}&transactionNo=${transactionNo}&message=${encodeURIComponent('Thanh toán thành công')}`
        );
      } else {
        // Thanh toán thất bại
        await orderService.updatePaymentStatus(orderId, 'FAILED');
        
        const errorMessage = vnpayResponseCodes[responseCode] || 'Thanh toán thất bại';
        console.log(`❌ Payment failed for order #${orderId}: ${errorMessage}`);
        
        return res.redirect(
          `http://localhost:5173/payment-return?status=error&orderId=${orderId}&message=${encodeURIComponent(errorMessage)}`
        );
      }

    } catch (error) {
      console.error('VNPay return error:', error);
      return res.redirect(
        `http://localhost:5173/?payment=error&message=${encodeURIComponent('Lỗi xử lý kết quả thanh toán')}`
      );
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

      res.json({
        success: true,
        data: {
          id: order.id,
          restaurant: {
            id: order.restaurant?.id,
            name: order.restaurant?.name,
            address: order.restaurant?.address,
            phone: order.restaurant?.phone
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
          note: order.note,
          total_price: parseFloat(order.total_price),
          status: order.status,
          payment: {
            method: order.payment?.method,
            status: order.payment?.status,
            amount: parseFloat(order.payment?.amount || 0)
          },
          created_at: order.created_at,
          updated_at: order.updated_at
        }
      });

    } catch (error) {
      console.error('Get order detail error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy chi tiết đơn hàng'
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
}

module.exports = new OrderController();
