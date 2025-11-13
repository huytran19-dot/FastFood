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

module.exports = router;
