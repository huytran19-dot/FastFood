const express = require('express');
const router = express.Router();
const userAuthController = require('../controllers/userAuthController');

// POST /auth/register - Register new user
router.post('/register', userAuthController.register);

// GET /auth/verify-email - Verify email with token
router.get('/verify-email', userAuthController.verifyEmail);

// POST /auth/login - Login user
router.post('/login', userAuthController.login);

// POST /auth/resend-verification - Resend verification email
router.post('/resend-verification', userAuthController.resendVerification);

module.exports = router;
