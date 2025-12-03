const favoriteService = require('../services/favoriteService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Add a character to favorites
 * POST /api/favorites
 */
const addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { characterId } = req.body;

    if (!characterId) {
      const error = new Error('Character ID is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const favorite = await favoriteService.addToFavorites(userId, characterId);

    res.status(201).json(successResponse({
      favoriteId: favorite._id,
      characterId: favorite.characterId._id,
      userId: favorite.userId,
      character: favorite.characterId
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a character from favorites
 * DELETE /api/favorites/:characterId
 */
const removeFromFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { characterId } = req.params;

    const result = await favoriteService.removeFromFavorites(userId, characterId);

    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all favorite characters
 * GET /api/favorites
 */
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const characters = await favoriteService.getFavoriteCharacters(userId);

    res.status(200).json(successResponse(characters));
  } catch (error) {
    next(error);
  }
};

/**
 * Get personalized character recommendations
 * GET /api/favorites/recommendations
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await favoriteService.getCharacterRecommendations(userId, limit);

    res.status(200).json(successResponse(recommendations));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  getRecommendations
};
