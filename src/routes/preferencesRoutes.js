const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validator');

// Get user preferences
router.get('/', authenticate, preferencesController.getPreferences);

// Update user preferences
router.put(
  '/',
  authenticate,
  validate(schemas.updatePreferences),
  preferencesController.updatePreferences
);

module.exports = router;
