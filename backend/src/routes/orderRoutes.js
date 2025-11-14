const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');
const authMiddleware = require('../middlewares/auth');

// Các routes cần authentication
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getOrders);
router.get('/:id', authMiddleware, orderController.getOrderDetail);
router.patch('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.patch('/:id/cancel', authMiddleware, orderController.cancelOrder);
router.post('/:id/confirm-delivery', authMiddleware, orderController.confirmDeliveryWithOtp);

module.exports = router;
