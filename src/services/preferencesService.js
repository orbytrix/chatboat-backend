const UserPreferences = require('../models/UserPreferences');
const logger = require('../utils/logger');

/**
 * Get user preferences with defaults
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User preferences
 */
const getPreferences = async (userId) => {
  try {
    let preferences = await UserPreferences.findOne({ userId });
    
    // If preferences don't exist, create default preferences
    if (!preferences) {
      preferences = await createDefaultPreferences(userId);
      logger.info(`Created default preferences for user: ${userId}`);
    }

    return {
      notifications: preferences.notifications,
      language: preferences.language,
      saveChatHistory: preferences.saveChatHistory,
      updatedAt: preferences.updatedAt
    };
  } catch (error) {
    logger.error('Error getting user preferences:', error);
    throw error;
  }
};

/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} updateData - Preferences to update
 * @param {boolean} [updateData.notifications] - Notification preference
 * @param {string} [updateData.language] - Language preference
 * @param {boolean} [updateData.saveChatHistory] - Chat history saving preference
 * @returns {Promise<Object>} Updated preferences
 */
const updatePreferences = async (userId, updateData) => {
  try {
    let preferences = await UserPreferences.findOne({ userId });
    
    // If preferences don't exist, create them first
    if (!preferences) {
      preferences = await createDefaultPreferences(userId);
      logger.info(`Created default preferences for user: ${userId}`);
    }

    // Update allowed fields
    if (updateData.notifications !== undefined) {
      preferences.notifications = updateData.notifications;
    }
    
    if (updateData.language !== undefined) {
      preferences.language = updateData.language;
    }
    
    if (updateData.saveChatHistory !== undefined) {
      preferences.saveChatHistory = updateData.saveChatHistory;
    }

    await preferences.save();

    logger.info(`User preferences updated for user: ${userId}`);

    return {
      notifications: preferences.notifications,
      language: preferences.language,
      saveChatHistory: preferences.saveChatHistory,
      updatedAt: preferences.updatedAt
    };
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Create default preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created preferences
 */
const createDefaultPreferences = async (userId) => {
  try {
    const preferences = new UserPreferences({
      userId,
      notifications: true,
      language: 'en',
      saveChatHistory: true
    });

    await preferences.save();
    
    logger.info(`Default preferences created for user: ${userId}`);
    
    return preferences;
  } catch (error) {
    logger.error('Error creating default preferences:', error);
    throw error;
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  createDefaultPreferences
};
