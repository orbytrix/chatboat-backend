const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// All analytics routes require admin authentication

// Get character usage statistics
router.get('/characters', authenticate, requireAdmin, analyticsController.getCharacterStatistics);

// Get category popularity metrics
router.get('/categories', authenticate, requireAdmin, analyticsController.getCategoryPopularity);

// Get user engagement data
router.get('/users', authenticate, requireAdmin, analyticsController.getUserEngagement);

module.exports = router;
