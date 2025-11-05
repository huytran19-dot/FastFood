const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers');

// POST /api/auth/login - Login for all users
router.post('/login', authControllers.login);

// POST /api/auth/signup-user - Register customer
router.post('/signup-user', authControllers.signupUser);

// POST /api/auth/signup-owner - Register restaurant owner
router.post('/signup-owner', authControllers.signupOwner);

module.exports = router;
