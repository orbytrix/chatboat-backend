const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/authMiddleware');

// All favorite routes require authentication
router.use(authenticate);

// Add character to favorites
router.post('/', favoriteController.addToFavorites);

// Remove character from favorites
router.delete('/:characterId', favoriteController.removeFromFavorites);

// Get favorite characters
router.get('/', favoriteController.getFavorites);

// Get character recommendations
router.get('/recommendations', favoriteController.getRecommendations);

module.exports = router;
