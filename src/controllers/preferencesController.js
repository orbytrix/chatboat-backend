const preferencesService = require('../services/preferencesService');
const logger = require('../utils/logger');

/**
 * Get user preferences
 * GET /api/preferences
 */
const getPreferences = async (req, res) => {
  try {
    const userId = req.userId;
    
    const preferences = await preferencesService.getPreferences(userId);
    
    return res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    logger.error('Get preferences error:', error);
    
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || 'SERVER_ERROR';
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'Failed to retrieve preferences'
      }
    });
  }
};

/**
 * Update user preferences
 * PUT /api/preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = {};
    
    // Extract allowed fields from request body
    if (req.body.notifications !== undefined) {
      updateData.notifications = req.body.notifications;
    }
    
    if (req.body.language !== undefined) {
      updateData.language = req.body.language;
    }
    
    if (req.body.saveChatHistory !== undefined) {
      updateData.saveChatHistory = req.body.saveChatHistory;
    }
    
    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No valid fields provided for update'
        }
      });
    }
    
    const updatedPreferences = await preferencesService.updatePreferences(userId, updateData);
    
    return res.status(200).json({
      success: true,
      data: updatedPreferences
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || 'SERVER_ERROR';
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'Failed to update preferences'
      }
    });
  }
};

module.exports = {
  getPreferences,
  updatePreferences
};
