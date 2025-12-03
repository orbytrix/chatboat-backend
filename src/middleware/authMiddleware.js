const jwt = require('jsonwebtoken');
const User = require('../models/User');
const tokenBlacklist = require('../utils/tokenBlacklist');
const logger = require('../utils/logger');

/**
 * Authentication middleware to verify JWT tokens
 * Checks token validity, blacklist status, and extracts user information
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken; // Get from cookie
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'No token provided. Include token in Authorization header or cookie.'
        }
      });
    }

    // Check if token is blacklisted (logged out)
    if (tokenBlacklist.isBlacklisted(token)) {
      logger.warn('Attempt to use blacklisted token');
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Token has been invalidated. Please login again.'
        }
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired. Please refresh your token or login again.'
          }
        });
      }
      
      logger.warn(`Invalid token: ${err.message}`);
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid token. Please login again.'
        }
      });
    }

    // Extract user information from token
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid token payload'
        }
      });
    }

    // Fetch user from database to ensure user still exists and is active
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'User not found'
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'User account is inactive'
        }
      });
    }

    // Attach user and token to request object
    req.user = user;
    req.userId = user._id;
    req.token = token;
    
    logger.debug(`User authenticated: ${user.email}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Authentication failed due to server error'
      }
    });
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated vs unauthenticated users
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    // If no token provided, continue without authentication
    if (!token) {
      return next();
    }

    // Check if token is blacklisted
    if (tokenBlacklist.isBlacklisted(token)) {
      return next();
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      
      if (userId) {
        const user = await User.findById(userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id;
          req.token = token;
          logger.debug(`Optional auth: User authenticated: ${user.email}`);
        }
      }
    } catch (err) {
      // Token invalid or expired, continue without authentication
      logger.debug('Optional auth: Invalid or expired token, continuing without auth');
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    // Don't fail the request, just continue without authentication
    next();
  }
};

/**
 * Admin authorization middleware
 * Must be used after authenticate middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_FAILED',
        message: 'Authentication required'
      }
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn(`Unauthorized admin access attempt by user: ${req.user.email}`);
    return res.status(403).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin access required'
      }
    });
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireAdmin
};
