const Favorite = require('../models/Favorite');
const Character = require('../models/Character');
const { getRecommendations } = require('./recommendationService');

/**
 * Add a character to user's favorites
 * @param {string} userId - The user's ID
 * @param {string} characterId - The character's ID
 * @returns {Promise<Object>} The created favorite
 */
const addToFavorites = async (userId, characterId) => {
  try {
    // Check if character exists
    const character = await Character.findById(characterId);
    if (!character) {
      const error = new Error('Character not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({ userId, characterId });
    if (existingFavorite) {
      const error = new Error('Character is already in favorites');
      error.statusCode = 400;
      error.code = 'DUPLICATE_ENTRY';
      throw error;
    }

    // Create favorite
    const favorite = await Favorite.create({ userId, characterId });
    
    // Populate character details
    await favorite.populate('characterId');
    
    return favorite;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove a character from user's favorites
 * @param {string} userId - The user's ID
 * @param {string} characterId - The character's ID
 * @returns {Promise<Object>} Deletion result
 */
const removeFromFavorites = async (userId, characterId) => {
  try {
    const favorite = await Favorite.findOneAndDelete({ userId, characterId });
    
    if (!favorite) {
      const error = new Error('Favorite not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return { message: 'Character removed from favorites successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all favorite characters for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of favorite characters
 */
const getFavoriteCharacters = async (userId) => {
  try {
    const favorites = await Favorite.find({ userId })
      .populate({
        path: 'characterId',
        populate: [
          { path: 'categoryId', select: 'name description icon' },
          { path: 'creatorId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    // Extract character objects
    const characters = favorites
      .filter(fav => fav.characterId)
      .map(fav => fav.characterId);

    return characters;
  } catch (error) {
    throw error;
  }
};

/**
 * Get personalized character recommendations for a user
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of recommendations
 * @returns {Promise<Array>} Array of recommended characters
 */
const getCharacterRecommendations = async (userId, limit = 10) => {
  try {
    const recommendations = await getRecommendations(userId, limit);
    return recommendations;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavoriteCharacters,
  getCharacterRecommendations
};
