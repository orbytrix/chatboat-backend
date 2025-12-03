const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Register a new user
router.post('/register', authLimiter, authController.register);

// Login with email and password
router.post('/login', authLimiter, authController.login);

// Authenticate with Apple Sign-In
router.post('/apple', authLimiter, authController.appleSignIn);

// Authenticate with Google Sign-In
router.post('/google', authLimiter, authController.googleSignIn);

// Refresh access token
router.post('/refresh', authLimiter, authController.refreshToken);

// Logout user
router.post('/logout', authenticate, authController.logout);

module.exports = router;
