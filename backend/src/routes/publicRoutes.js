const express = require('express');
const router = express.Router();
const publicControllers = require('../controllers/publicControllers');

// Public routes - không cần authentication

// GET /api/public/restaurants - Lấy danh sách nhà hàng
router.get('/restaurants', publicControllers.getRestaurants);

// GET /api/public/restaurants/:id - Lấy thông tin nhà hàng
router.get('/restaurants/:id', publicControllers.getRestaurantById);

// GET /api/public/restaurants/:id/menu - Lấy menu của nhà hàng
router.get('/restaurants/:id/menu', publicControllers.getRestaurantMenu);

module.exports = router;
