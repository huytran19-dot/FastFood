const db = require('../models');
const { carts, cart_items, menu_items } = db;

class CartService {
  // Lấy hoặc tạo cart cho user
  async getOrCreateCart(userId) {
    let cart = await carts.findOne({
      where: { user_id: userId },
      include: [{
        model: cart_items,
        as: 'cart_items',
        include: [{
          model: menu_items,
          as: 'item',
          attributes: ['id', 'name', 'description', 'price', 'image_url', 'restaurant_id']
        }]
      }]
    });

    if (!cart) {
      cart = await carts.create({ user_id: userId });
      cart.cart_items = [];
    }

    return cart;
  }

  // Thêm item vào cart
  async addToCart(userId, menuItemId, quantity = 1) {
    try {
      // Kiểm tra menu item có tồn tại không
      const menuItem = await menu_items.findByPk(menuItemId);
      if (!menuItem) {
        throw new Error('Món ăn không tồn tại');
      }

      // Lấy hoặc tạo cart
      let cart = await carts.findOne({ where: { user_id: userId } });
      if (!cart) {
        cart = await carts.create({ user_id: userId });
      }

      // Kiểm tra item đã có trong cart chưa
      let cartItem = await cart_items.findOne({
        where: {
          cart_id: cart.id,
          item_id: menuItemId
        }
      });

      if (cartItem) {
        // Cập nhật quantity
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        // Tạo mới cart item
        cartItem = await cart_items.create({
          cart_id: cart.id,
          item_id: menuItemId,
          quantity
        });
      }

      // Trả về cart đầy đủ
      return await this.getOrCreateCart(userId);
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật quantity
  async updateQuantity(userId, cartItemId, quantity) {
    const cart = await carts.findOne({ where: { user_id: userId } });
    if (!cart) {
      throw new Error('Giỏ hàng không tồn tại');
    }

    const cartItem = await cart_items.findOne({
      where: {
        id: cartItemId,
        cart_id: cart.id
      }
    });

    if (!cartItem) {
      throw new Error('Món ăn không có trong giỏ hàng');
    }

    if (quantity <= 0) {
      await cartItem.destroy();
    } else {
      cartItem.quantity = quantity;
      await cartItem.save();
    }

    return await this.getOrCreateCart(userId);
  }

  // Xóa item khỏi cart
  async removeItem(userId, cartItemId) {
    const cart = await carts.findOne({ where: { user_id: userId } });
    if (!cart) {
      throw new Error('Giỏ hàng không tồn tại');
    }

    const cartItem = await cart_items.findOne({
      where: {
        id: cartItemId,
        cart_id: cart.id
      }
    });

    if (!cartItem) {
      throw new Error('Món ăn không có trong giỏ hàng');
    }

    await cartItem.destroy();
    return await this.getOrCreateCart(userId);
  }

  // Xóa toàn bộ cart
  async clearCart(userId) {
    const cart = await carts.findOne({ where: { user_id: userId } });
    if (cart) {
      await cart_items.destroy({ where: { cart_id: cart.id } });
    }
    return { message: 'Giỏ hàng đã được xóa' };
  }
}

module.exports = new CartService();
