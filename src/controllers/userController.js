const userService = require('../services/userService');
const tokenBlacklist = require('../utils/tokenBlacklist');
const logger = require('../utils/logger');

/**
 * Get user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const profile = await userService.getProfile(userId);
    
    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || 'SERVER_ERROR';
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'Failed to retrieve profile'
      }
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = {};
    
    // Extract allowed fields from request body
    if (req.body.name !== undefined) {
      updateData.name = req.body.name;
    }
    
    // Handle avatar upload (Cloudinary URL from upload middleware)
    if (req.cloudinaryResult) {
      updateData.avatar = req.cloudinaryResult.url;
      updateData.avatarPublicId = req.cloudinaryResult.publicId;
    } else if (req.body.avatar !== undefined) {
      updateData.avatar = req.body.avatar;
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
    
    const updatedProfile = await userService.updateProfile(userId, updateData);
    
    return res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || 'SERVER_ERROR';
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'Failed to update profile'
      }
    });
  }
};

/**
 * Delete user account
 * DELETE /api/users/profile
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const token = req.token;
    
    // Delete user account and all associated data
    const deletionResult = await userService.deleteAccount(userId);
    
    // Blacklist the current token to invalidate it
    if (token) {
      tokenBlacklist.add(token);
      logger.info('Token blacklisted after account deletion');
    }
    
    return res.status(200).json({
      success: true,
      message: 'Account successfully deleted',
      data: {
        deletedUser: deletionResult.user,
        deletedData: deletionResult.deletedData
      }
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || 'SERVER_ERROR';
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'Failed to delete account'
      }
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
