const express = require('express');
const router = express.Router();
const restaurantControllers = require('../controllers/restaurantControllers');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

// Public routes
router.get('/public', restaurantControllers.getPublicRestaurants);

// Protected routes - require authentication and restaurant role
router.use(authMiddleware);
router.use(roleMiddleware(['restaurant']));

// POST /api/restaurants - Create new restaurant
router.post('/', restaurantControllers.createRestaurant);

// GET /api/restaurants/mine - Get owner's restaurant
router.get('/mine', restaurantControllers.getMyRestaurant);

// PUT /api/restaurants/mine - Update owner's restaurant
router.put('/mine', restaurantControllers.updateMyRestaurant);

// GET /api/restaurants/stats - Get restaurant statistics
router.get('/stats', restaurantControllers.getRestaurantStats);

module.exports = router;
