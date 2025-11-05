const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const authMiddleware = require('../middlewares/auth');

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users/me - Get current user
router.get('/me', userControllers.getCurrentUser);

// PUT /api/users/me - Update current user profile
router.put('/me', userControllers.updateProfile);

module.exports = router;
