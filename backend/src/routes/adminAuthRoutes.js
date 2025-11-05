const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminAuthControllers');

// 🧠 Admin Login Route
// No middleware required for login
router.post('/login', AdminController.login);

// Note: Admin accounts should be created manually in database
// User management routes are handled by adminRoutes.js

module.exports = router;
