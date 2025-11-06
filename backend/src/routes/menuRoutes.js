const express = require('express');
const router = express.Router();
const menuControllers = require('../controllers/menuControllers');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

// Protected routes - require authentication and restaurant role
router.use(authMiddleware);
router.use(roleMiddleware(['restaurant']));

// GET /api/menu/stats - Get menu statistics (must be before /:id)
router.get('/stats', menuControllers.getMenuStats);

// GET /api/menu - Get all menu items
router.get('/', menuControllers.getMenuItems);

// GET /api/menu/:id - Get single menu item
router.get('/:id', menuControllers.getMenuItemById);

// POST /api/menu - Create menu item
router.post('/', menuControllers.createMenuItem);

// PUT /api/menu/:id - Update menu item
router.put('/:id', menuControllers.updateMenuItem);

// PATCH /api/menu/:id/toggle - Toggle availability
router.patch('/:id/toggle', menuControllers.toggleMenuItemAvailability);

// DELETE /api/menu/:id - Delete menu item
router.delete('/:id', menuControllers.deleteMenuItem);

module.exports = router;
