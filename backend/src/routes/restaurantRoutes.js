const express = require('express');
const router = express.Router();
const restaurantControllers = require('../controllers/restaurantControllers');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

// Public routes (no auth)
router.get('/public', restaurantControllers.getPublicRestaurants);

// Protected routes - require authentication only (no role check for /mine)
// This allows new restaurant owners to check if they have a restaurant
router.get('/mine', authMiddleware, restaurantControllers.getMyRestaurant);

// Protected routes - require authentication AND restaurant role
router.use(authMiddleware);
router.use(roleMiddleware(['restaurant']));

// POST /api/restaurants - Create new restaurant
router.post('/', restaurantControllers.createRestaurant);

// PUT /api/restaurants/mine - Update owner's restaurant
router.put('/mine', restaurantControllers.updateMyRestaurant);

// GET /api/restaurants/stats - Get restaurant statistics
router.get('/stats', restaurantControllers.getRestaurantStats);

// Orders management
// GET /api/restaurant/orders - Get all orders for restaurant
router.get('/orders', restaurantControllers.getRestaurantOrders);

// GET /api/restaurant/orders/:id - Get order detail
router.get('/orders/:id', restaurantControllers.getRestaurantOrderDetail);

// PUT /api/restaurant/orders/:id/status - Update order status
router.put('/orders/:id/status', restaurantControllers.updateOrderStatus);

// Drone management
// GET /api/restaurant/drones - Get available drones
router.get('/drones', restaurantControllers.getAvailableDrones);

// POST /api/restaurant/orders/:id/assign-drone - Assign order to drone
router.post('/orders/:id/assign-drone', restaurantControllers.assignOrderToDrone);

// POST /api/restaurant/orders/:id/start-delivery - Start drone delivery
router.post('/orders/:id/start-delivery', restaurantControllers.startDelivery);

// GET /api/restaurant/drones/:id/position - Get real-time drone position
router.get('/drones/:id/position', restaurantControllers.getDronePosition);

// GET /api/restaurant/orders/:id/distance - Get distance from drone to destination
router.get('/orders/:id/distance', restaurantControllers.getOrderDistance);

module.exports = router;
