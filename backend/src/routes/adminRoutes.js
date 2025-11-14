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

// ===== ORDER MANAGEMENT =====
router.get('/orders', adminControllers.getAllOrders);

// ===== DRONE MANAGEMENT =====
router.get('/drones', adminControllers.getAllDrones);
router.post('/drones', adminControllers.createDrone);
router.put('/drones/:id', adminControllers.updateDrone);
router.delete('/drones/:id', adminControllers.deleteDrone);

// ===== ORDER-DRONE ASSIGNMENT =====
router.post('/orders/:id/assign-drone', adminControllers.assignOrderToDrone);

module.exports = router;
