const express = require('express');
const router = express.Router();
const RestaurantAuthController = require('../controllers/restaurantAuthControllers');

// 🏪 Restaurant Owner Login Route
router.post('/login', RestaurantAuthController.login);

module.exports = router;
