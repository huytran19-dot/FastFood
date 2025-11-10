const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartControllers');
const authMiddleware = require('../middlewares/auth');

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/cart - Lấy giỏ hàng
router.get('/', cartController.getCart);

// POST /api/cart/items - Thêm món vào giỏ hàng
router.post('/items', cartController.addToCart);

// PATCH /api/cart/items/:id - Cập nhật số lượng
router.patch('/items/:id', cartController.updateQuantity);

// DELETE /api/cart/items/:id - Xóa món
router.delete('/items/:id', cartController.removeItem);

// DELETE /api/cart - Xóa toàn bộ giỏ hàng
router.delete('/', cartController.clearCart);

module.exports = router;
