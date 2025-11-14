const cartService = require('../services/cartServices');

// Helper function để format cart response
function formatCartResponse(cart) {
  const total = cart.cart_items.reduce((sum, item) => {
    return sum + (parseFloat(item.item?.price || 0) * item.quantity);
  }, 0);

  return {
    id: cart.id,
    items: cart.cart_items.map(item => ({
      id: item.id,
      menu_item_id: item.item_id,
      name: item.item?.name || '',
      description: item.item?.description || '',
      price: parseFloat(item.item?.price || 0),
      image: item.item?.image_url || '',
      quantity: item.quantity,
      subtotal: parseFloat(item.item?.price || 0) * item.quantity,
      restaurant_id: item.item?.restaurant_id
    })),
    total,
    itemCount: cart.cart_items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

class CartController {
  // GET /api/cart - Lấy giỏ hàng hiện tại
  async getCart(req, res) {
    try {
      const cart = await cartService.getOrCreateCart(req.user.id);
      
      console.log('===== GET CART DEBUG =====');
      console.log('User ID:', req.user.id);
      console.log('Cart ID:', cart?.id);
      console.log('Raw cart_items:', cart?.cart_items);
      console.log('Items count:', cart?.cart_items?.length || 0);
      
      res.json({
        success: true,
        data: formatCartResponse(cart)
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy giỏ hàng',
        error: error.message
      });
    }
  }

  // POST /api/cart/items - Thêm món vào giỏ hàng
  async addToCart(req, res) {
    try {
      const { menu_item_id, quantity = 1 } = req.body;

      if (!menu_item_id) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin món ăn'
        });
      }

      const cart = await cartService.addToCart(req.user.id, menu_item_id, quantity);
      
      res.json({
        success: true,
        message: 'Đã thêm vào giỏ hàng',
        data: formatCartResponse(cart)
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi thêm vào giỏ hàng',
        error: error.message
      });
    }
  }

  // PATCH /api/cart/items/:id - Cập nhật số lượng
  async updateQuantity(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng không hợp lệ'
        });
      }

      const cart = await cartService.updateQuantity(req.user.id, id, quantity);
      
      res.json({
        success: true,
        message: quantity === 0 ? 'Đã xóa khỏi giỏ hàng' : 'Đã cập nhật số lượng',
        data: formatCartResponse(cart)
      });
    } catch (error) {
      console.error('Update quantity error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật số lượng',
        error: error.message
      });
    }
  }

  // DELETE /api/cart/items/:id - Xóa món khỏi giỏ hàng
  async removeItem(req, res) {
    try {
      const { id } = req.params;
      const cart = await cartService.removeItem(req.user.id, id);
      
      res.json({
        success: true,
        message: 'Đã xóa khỏi giỏ hàng',
        data: formatCartResponse(cart)
      });
    } catch (error) {
      console.error('Remove item error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa món',
        error: error.message
      });
    }
  }

  // DELETE /api/cart - Xóa toàn bộ giỏ hàng
  async clearCart(req, res) {
    try {
      await cartService.clearCart(req.user.id);
      res.json({
        success: true,
        message: 'Giỏ hàng đã được xóa',
        data: {
          items: [],
          total: 0,
          itemCount: 0
        }
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa giỏ hàng',
        error: error.message
      });
    }
  }
}

module.exports = new CartController();
