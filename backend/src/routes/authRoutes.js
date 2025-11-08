const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers');
const userAuthController = require('../controllers/userAuthController');

// ===== USER AUTH WITH EMAIL VERIFICATION =====
// POST /api/auth/register - Register new user with email verification
router.post('/register', userAuthController.register);

// GET /api/auth/verify-email - Verify email with token
router.get('/verify-email', userAuthController.verifyEmail);

// POST /api/auth/user/login - Login user (requires email verification)
router.post('/user/login', userAuthController.login);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', userAuthController.resendVerification);

// ===== LEGACY ROUTES (keep for backward compatibility) =====
// POST /api/auth/login - Login for all users
router.post('/login', authControllers.login);

// POST /api/auth/signup-user - Register customer
router.post('/signup-user', authControllers.signupUser);

// POST /api/auth/signup-owner - Register restaurant owner
router.post('/signup-owner', authControllers.signupOwner);

module.exports = router;
