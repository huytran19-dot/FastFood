const express = require('express');
const router = express.Router();
const restaurantAuthController = require('../controllers/restaurantAuthControllers');

// Restaurant login
router.post('/login', restaurantAuthController.login);

module.exports = router;
