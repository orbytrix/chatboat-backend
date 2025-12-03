const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');
const { validate, schemas } = require('../middleware/validator');

// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// Update user profile
router.put(
  '/profile',
  authenticate,
  uploadAvatar,
  validate(schemas.updateProfile),
  userController.updateProfile
);

// Delete user account
router.delete('/profile', authenticate, userController.deleteAccount);

module.exports = router;
