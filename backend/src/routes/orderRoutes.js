const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');
const authMiddleware = require('../middlewares/auth');

// VNPay callback - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/vnpay-return', orderController.vnpayReturn);

// Các routes cần authentication
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getOrders);
router.get('/:id', authMiddleware, orderController.getOrderDetail);
router.patch('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;
