const User = require('../models/User');
const Character = require('../models/Character');
const ChatSession = require('../models/ChatSession');
const Favorite = require('../models/Favorite');
const RefreshToken = require('../models/RefreshToken');
const UserPreferences = require('../models/UserPreferences');
const { deleteFromCloudinary, extractPublicId } = require('../middleware/uploadMiddleware');
const logger = require('../utils/logger');

/**
 * Get user profile by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Get user preferences
    const preferences = await UserPreferences.findOne({ userId });

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      authProvider: user.authProvider,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: preferences ? {
        notifications: preferences.notifications,
        language: preferences.language,
        saveChatHistory: preferences.saveChatHistory
      } : null
    };
  } catch (error) {
    logger.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update (name, avatar)
 * @returns {Promise<Object>} Updated user profile
 */
const updateProfile = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Update allowed fields
    if (updateData.name !== undefined) {
      user.name = updateData.name;
    }
    
    if (updateData.avatar !== undefined) {
      // Delete old avatar from Cloudinary if it exists
      if (user.avatar && user.avatarPublicId) {
        try {
          await deleteFromCloudinary(user.avatarPublicId);
          logger.info(`Old avatar deleted from Cloudinary: ${user.avatarPublicId}`);
        } catch (deleteError) {
          logger.warn(`Failed to delete old avatar from Cloudinary: ${deleteError.message}`);
          // Continue with update even if deletion fails
        }
      }
      
      user.avatar = updateData.avatar;
      
      // Store Cloudinary public ID if provided
      if (updateData.avatarPublicId) {
        user.avatarPublicId = updateData.avatarPublicId;
      }
    }

    await user.save();

    logger.info(`User profile updated: ${user.email}`);

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      authProvider: user.authProvider,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    logger.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Delete user account with cascade deletion
 * Deletes user and all associated data:
 * - Characters created by user
 * - Chat sessions
 * - Favorites
 * - Refresh tokens
 * - User preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Delete user avatar from Cloudinary if it exists
    if (user.avatar && user.avatarPublicId) {
      try {
        await deleteFromCloudinary(user.avatarPublicId);
        logger.info(`User avatar deleted from Cloudinary: ${user.avatarPublicId}`);
      } catch (deleteError) {
        logger.warn(`Failed to delete user avatar from Cloudinary: ${deleteError.message}`);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    // Cascade deletion - delete all related data
    const deletionResults = {
      user: user.email,
      deletedData: {}
    };

    // Delete characters created by user (and their avatars from Cloudinary)
    const userCharacters = await Character.find({ creatorId: userId });
    for (const character of userCharacters) {
      if (character.avatar) {
        const publicId = character.avatarPublicId || extractPublicId(character.avatar);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
            logger.info(`Character avatar deleted from Cloudinary: ${publicId}`);
          } catch (deleteError) {
            logger.warn(`Failed to delete character avatar from Cloudinary: ${deleteError.message}`);
          }
        }
      }
    }
    const charactersResult = await Character.deleteMany({ creatorId: userId });
    deletionResults.deletedData.characters = charactersResult.deletedCount;
    logger.info(`Deleted ${charactersResult.deletedCount} characters for user ${user.email}`);

    // Delete chat sessions
    const chatSessionsResult = await ChatSession.deleteMany({ userId });
    deletionResults.deletedData.chatSessions = chatSessionsResult.deletedCount;
    logger.info(`Deleted ${chatSessionsResult.deletedCount} chat sessions for user ${user.email}`);

    // Delete favorites
    const favoritesResult = await Favorite.deleteMany({ userId });
    deletionResults.deletedData.favorites = favoritesResult.deletedCount;
    logger.info(`Deleted ${favoritesResult.deletedCount} favorites for user ${user.email}`);

    // Delete refresh tokens
    const refreshTokensResult = await RefreshToken.deleteMany({ userId });
    deletionResults.deletedData.refreshTokens = refreshTokensResult.deletedCount;
    logger.info(`Deleted ${refreshTokensResult.deletedCount} refresh tokens for user ${user.email}`);

    // Delete user preferences
    const preferencesResult = await UserPreferences.deleteOne({ userId });
    deletionResults.deletedData.preferences = preferencesResult.deletedCount;
    logger.info(`Deleted preferences for user ${user.email}`);

    // Finally, delete the user
    await User.findByIdAndDelete(userId);
    logger.info(`User account deleted: ${user.email}`);

    return deletionResults;
  } catch (error) {
    logger.error('Error deleting user account:', error);
    throw error;
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
