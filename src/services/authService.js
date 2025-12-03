const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const UserPreferences = require('../models/UserPreferences');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, calculateExpirationDate, REFRESH_TOKEN_EXPIRES_IN } = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * Register a new user with email and password
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User name
 * @returns {Object} User object and tokens
 */
const register = async ({ email, password, name }) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('DUPLICATE_ENTRY');
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      authProvider: 'local',
    });

    await user.save();

    logger.info(`New user registered: ${user.email}`);

    // Create default preferences for the new user
    try {
      await UserPreferences.create({
        userId: user._id,
        notifications: true,
        language: 'en',
        saveChatHistory: true
      });
      logger.info(`Default preferences created for user: ${user.email}`);
    } catch (prefError) {
      // Log error but don't fail registration if preferences creation fails
      logger.error(`Failed to create default preferences for user ${user.email}:`, prefError);
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };

    return {
      user: userData,
      ...tokens,
    };
  } catch (error) {
    logger.error('Error in register service:', error);
    throw error;
  }
};

/**
 * Login user with email and password
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Object} User object and tokens
 */
const login = async ({ email, password }) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('AUTH_FAILED');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('UNAUTHORIZED');
    }

    // Check if user registered with OAuth
    if (user.authProvider !== 'local' || !user.password) {
      throw new Error('AUTH_FAILED');
    }

    // Verify password
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('AUTH_FAILED');
    }

    logger.info(`User logged in: ${user.email}`);

    // Generate tokens
    const tokens = await generateTokens(user);

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };

    return {
      user: userData,
      ...tokens,
    };
  } catch (error) {
    logger.error('Error in login service:', error);
    throw error;
  }
};

/**
 * Generate access and refresh tokens for user
 * @param {Object} user - User object
 * @returns {Object} Access token and refresh token
 */
const generateTokens = async (user) => {
  try {
    // Generate access token
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      userId: user._id,
    });

    // Store refresh token in database
    const expiresAt = calculateExpirationDate(REFRESH_TOKEN_EXPIRES_IN);
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error('Error generating tokens:', error);
    throw new Error('Failed to generate tokens');
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} New access token and refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      throw new Error('TOKEN_INVALID');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await RefreshToken.deleteOne({ _id: storedToken._id });
      throw new Error('TOKEN_EXPIRED');
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error('UNAUTHORIZED');
    }

    // Delete old refresh token (token rotation)
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // Generate new tokens
    const tokens = await generateTokens(user);

    logger.info(`Tokens refreshed for user: ${user.email}`);

    return tokens;
  } catch (error) {
    logger.error('Error refreshing token:', error);
    throw error;
  }
};

/**
 * Logout user by invalidating refresh token
 * @param {string} refreshToken - Refresh token to invalidate
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
const logout = async (refreshToken, userId) => {
  try {
    // Delete refresh token from database
    const result = await RefreshToken.deleteOne({
      token: refreshToken,
      userId,
    });

    if (result.deletedCount > 0) {
      logger.info(`User logged out: ${userId}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error in logout service:', error);
    throw error;
  }
};

/**
 * Delete all refresh tokens for a user
 * @param {string} userId - User ID
 * @returns {number} Number of tokens deleted
 */
const logoutAllDevices = async (userId) => {
  try {
    const result = await RefreshToken.deleteMany({ userId });
    logger.info(`All tokens deleted for user: ${userId}, count: ${result.deletedCount}`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error logging out all devices:', error);
    throw error;
  }
};

/**
 * Clean up expired refresh tokens
 * @returns {number} Number of tokens deleted
 */
const cleanupExpiredTokens = async () => {
  try {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} expired refresh tokens`);
    }

    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    throw error;
  }
};

module.exports = {
  register,
  login,
  generateTokens,
  refreshAccessToken,
  logout,
  logoutAllDevices,
  cleanupExpiredTokens,
};
