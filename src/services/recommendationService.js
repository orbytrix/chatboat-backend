const ChatSession = require('../models/ChatSession');
const Character = require('../models/Character');
const Favorite = require('../models/Favorite');

/**
 * Get personalized character recommendations for a user
 * Algorithm based on:
 * 1. User's chat history (characters they've interacted with)
 * 2. Categories of their favorite characters
 * 3. Character popularity
 * 
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} Array of recommended characters
 */
const getRecommendations = async (userId, limit = 10) => {
  try {
    // Get user's chat history to find categories they interact with
    const chatSessions = await ChatSession.find({ userId })
      .populate('characterId')
      .lean();

    // Get user's favorite characters
    const favorites = await Favorite.find({ userId })
      .populate('characterId')
      .lean();

    // Extract category IDs from chat history
    const chattedCategoryIds = chatSessions
      .filter(session => session.characterId)
      .map(session => session.characterId.categoryId);

    // Extract category IDs from favorites
    const favoriteCategoryIds = favorites
      .filter(fav => fav.characterId)
      .map(fav => fav.characterId.categoryId);

    // Combine and get unique category IDs (favorites weighted higher)
    const allCategoryIds = [...favoriteCategoryIds, ...favoriteCategoryIds, ...chattedCategoryIds];
    const uniqueCategoryIds = [...new Set(allCategoryIds.map(id => id.toString()))];

    // Get character IDs user has already interacted with or favorited
    const excludeCharacterIds = [
      ...chatSessions.filter(s => s.characterId).map(s => s.characterId._id),
      ...favorites.filter(f => f.characterId).map(f => f.characterId._id)
    ];

    // Build recommendation query
    const query = {
      _id: { $nin: excludeCharacterIds },
      isPublic: true
    };

    // If user has category preferences, prioritize those
    if (uniqueCategoryIds.length > 0) {
      query.categoryId = { $in: uniqueCategoryIds };
    }

    // Get recommended characters sorted by popularity
    const recommendations = await Character.find(query)
      .populate('categoryId', 'name description icon')
      .populate('creatorId', 'name')
      .sort({ popularity: -1 })
      .limit(limit)
      .lean();

    // If we don't have enough recommendations from preferred categories,
    // fill with popular characters from other categories
    if (recommendations.length < limit && uniqueCategoryIds.length > 0) {
      const additionalQuery = {
        _id: { 
          $nin: [
            ...excludeCharacterIds,
            ...recommendations.map(r => r._id)
          ]
        },
        isPublic: true,
        categoryId: { $nin: uniqueCategoryIds }
      };

      const additionalRecommendations = await Character.find(additionalQuery)
        .populate('categoryId', 'name description icon')
        .populate('creatorId', 'name')
        .sort({ popularity: -1 })
        .limit(limit - recommendations.length)
        .lean();

      recommendations.push(...additionalRecommendations);
    }

    return recommendations;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getRecommendations
};
