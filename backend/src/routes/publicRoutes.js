const express = require('express');
const router = express.Router();
const publicControllers = require('../controllers/publicControllers');
const restaurantControllers = require('../controllers/restaurantControllers');

// Public routes - không cần authentication

// GET /api/public/restaurants - Lấy danh sách nhà hàng
router.get('/restaurants', publicControllers.getRestaurants);

// GET /api/public/restaurants/nearby - Tìm nhà hàng gần (phải đặt trước :id route)
router.get('/restaurants/nearby', restaurantControllers.getNearbyRestaurants);

// GET /api/public/restaurants/:id - Lấy thông tin nhà hàng
router.get('/restaurants/:id', publicControllers.getRestaurantById);

// GET /api/public/restaurants/:id/menu - Lấy menu của nhà hàng
router.get('/restaurants/:id/menu', publicControllers.getRestaurantMenu);

// GET /api/public/restaurants/:id/categories - Lấy categories của nhà hàng
router.get('/restaurants/:id/categories', publicControllers.getRestaurantCategories);

module.exports = router;
