const express = require('express');
const router = express.Router();
const categoryControllers = require('../controllers/categoryControllers');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

// All routes require restaurant authentication
router.use(authMiddleware);
router.use(roleMiddleware(['restaurant']));

// Category CRUD routes
router.get('/', categoryControllers.getAllCategories);
router.post('/', categoryControllers.createCategory);
router.put('/:id', categoryControllers.updateCategory);
router.delete('/:id', categoryControllers.deleteCategory);
router.patch('/:id/toggle-status', categoryControllers.toggleCategoryStatus);

module.exports = router;
