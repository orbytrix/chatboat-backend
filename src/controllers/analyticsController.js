const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

/**
 * Analytics Controller
 * Handles HTTP requests for analytics endpoints (admin only)
 * Requirements: 13.1, 13.2, 13.3
 */

/**
 * Get character usage statistics
 * Admin only endpoint
 * Requirement: 13.1
 */
const getCharacterStatistics = async (req, res) => {
  try {
    logger.info(`Admin ${req.user.email} requested character statistics`);
    
    const statistics = await analyticsService.getCharacterStatistics();

    return res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    logger.error('Error in getCharacterStatistics controller:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to retrieve character statistics'
      }
    });
  }
};

/**
 * Get category popularity metrics
 * Admin only endpoint
 * Requirement: 13.2
 */
const getCategoryPopularity = async (req, res) => {
  try {
    logger.info(`Admin ${req.user.email} requested category popularity metrics`);
    
    const popularity = await analyticsService.getCategoryPopularity();

    return res.status(200).json({
      success: true,
      data: popularity
    });
  } catch (error) {
    logger.error('Error in getCategoryPopularity controller:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to retrieve category popularity metrics'
      }
    });
  }
};

/**
 * Get user engagement data
 * Admin only endpoint
 * Requirement: 13.3
 */
const getUserEngagement = async (req, res) => {
  try {
    logger.info(`Admin ${req.user.email} requested user engagement data`);
    
    const engagement = await analyticsService.getUserEngagement();

    return res.status(200).json({
      success: true,
      data: engagement
    });
  } catch (error) {
    logger.error('Error in getUserEngagement controller:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to retrieve user engagement data'
      }
    });
  }
};

module.exports = {
  getCharacterStatistics,
  getCategoryPopularity,
  getUserEngagement
};
