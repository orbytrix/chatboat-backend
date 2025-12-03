const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-in-production';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate access token (JWT)
 * @param {Object} payload - Token payload (userId, email, role)
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role || 'user',
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'chatbot-api',
        audience: 'chatbot-app',
      }
    );

    logger.debug(`Access token generated for user: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload (userId)
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        type: 'refresh',
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'chatbot-api',
        audience: 'chatbot-app',
      }
    );

    logger.debug(`Refresh token generated for user: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'chatbot-api',
      audience: 'chatbot-app',
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.debug('Access token expired');
      throw new Error('TOKEN_EXPIRED');
    } else if (error.name === 'JsonWebTokenError') {
      logger.debug('Invalid access token');
      throw new Error('TOKEN_INVALID');
    } else {
      logger.error('Error verifying access token:', error);
      throw new Error('TOKEN_INVALID');
    }
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'chatbot-api',
      audience: 'chatbot-app',
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.debug('Refresh token expired');
      throw new Error('TOKEN_EXPIRED');
    } else if (error.name === 'JsonWebTokenError') {
      logger.debug('Invalid refresh token');
      throw new Error('TOKEN_INVALID');
    } else {
      logger.error('Error verifying refresh token:', error);
      throw new Error('TOKEN_INVALID');
    }
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get token expiration time in milliseconds
 * @param {string} expiresIn - Expiration string (e.g., '1h', '7d')
 * @returns {number} Expiration time in milliseconds
 */
const getExpirationTime = (expiresIn) => {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit] || 1000);
};

/**
 * Calculate token expiration date
 * @param {string} expiresIn - Expiration string (e.g., '1h', '7d')
 * @returns {Date} Expiration date
 */
const calculateExpirationDate = (expiresIn) => {
  const expirationMs = getExpirationTime(expiresIn);
  return new Date(Date.now() + expirationMs);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  calculateExpirationDate,
  getExpirationTime,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
};
