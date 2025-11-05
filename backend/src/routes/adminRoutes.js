const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// ===== USER MANAGEMENT =====
router.get('/users', adminControllers.getAllUsers);
router.patch('/users/:id/status', adminControllers.toggleUserStatus);
router.delete('/users/:id', adminControllers.deleteUser);

// ===== RESTAURANT MANAGEMENT =====
router.get('/restaurants', adminControllers.getAllRestaurants);
router.put('/restaurants/:id/approve', adminControllers.approveRestaurant);
router.put('/restaurants/:id/reject', adminControllers.rejectRestaurant);
router.put('/restaurants/:id/toggle-status', adminControllers.toggleRestaurantStatus);

module.exports = router;
