const Character = require('../models/Character');
const ChatSession = require('../models/ChatSession');
const logger = require('../utils/logger');

/**
 * Verify that the authenticated user owns the character
 * Must be used after authenticate middleware
 */
const verifyCharacterOwnership = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Authentication required'
        }
      });
    }

    // Get character ID from params
    const characterId = req.params.id || req.params.characterId;
    
    if (!characterId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Character ID is required'
        }
      });
    }

    // Find character
    const character = await Character.findById(characterId);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Character not found'
        }
      });
    }

    // Check if user is the creator or an admin
    const isOwner = character.creatorId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      logger.warn(`Unauthorized character modification attempt by user ${req.userId} on character ${characterId}`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to modify this character'
        }
      });
    }

    // Attach character to request for use in controller
    req.character = character;
    
    logger.debug(`Character ownership verified for user ${req.userId}`);
    next();
  } catch (error) {
    logger.error('Error verifying character ownership:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to verify ownership'
      }
    });
  }
};

/**
 * Verify that the authenticated user owns the chat session
 * Must be used after authenticate middleware
 */
const verifyChatSessionOwnership = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Authentication required'
        }
      });
    }

    // Get session ID from params
    const sessionId = req.params.id || req.params.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

    // Find chat session
    const session = await ChatSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Chat session not found'
        }
      });
    }

    // Check if user owns the session or is an admin
    const isOwner = session.userId.toString() === req.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      logger.warn(`Unauthorized chat session access attempt by user ${req.userId} on session ${sessionId}`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to access this chat session'
        }
      });
    }

    // Attach session to request for use in controller
    req.chatSession = session;
    
    logger.debug(`Chat session ownership verified for user ${req.userId}`);
    next();
  } catch (error) {
    logger.error('Error verifying chat session ownership:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to verify ownership'
      }
    });
  }
};

/**
 * Generic ownership verification middleware factory
 * @param {Object} Model - Mongoose model to check
 * @param {string} ownerField - Field name that contains the owner ID (default: 'userId')
 * @param {string} paramName - Parameter name for resource ID (default: 'id')
 * @returns {Function} Express middleware function
 */
const verifyOwnership = (Model, ownerField = 'userId', paramName = 'id') => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_FAILED',
            message: 'Authentication required'
          }
        });
      }

      // Get resource ID from params
      const resourceId = req.params[paramName];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Resource ID is required'
          }
        });
      }

      // Find resource
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found'
          }
        });
      }

      // Check ownership
      const ownerId = resource[ownerField];
      if (!ownerId) {
        logger.error(`Owner field '${ownerField}' not found on resource`);
        return res.status(500).json({
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Invalid resource configuration'
          }
        });
      }

      const isOwner = ownerId.toString() === req.userId.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        logger.warn(`Unauthorized access attempt by user ${req.userId} on resource ${resourceId}`);
        return res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You do not have permission to access this resource'
          }
        });
      }

      // Attach resource to request
      req.resource = resource;
      
      next();
    } catch (error) {
      logger.error('Error verifying ownership:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to verify ownership'
        }
      });
    }
  };
};

module.exports = {
  verifyCharacterOwnership,
  verifyChatSessionOwnership,
  verifyOwnership
};
