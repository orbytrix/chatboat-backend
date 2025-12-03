const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const { generateTokens } = require('./authService');
const logger = require('../utils/logger');

/**
 * Authenticate or create user with Apple Sign-In
 * iOS app handles authentication, we just receive the Apple ID
 * @param {Object} appleData - Apple authentication data from iOS
 * @param {string} appleData.appleId - Apple user ID
 * @param {string} appleData.email - User email (optional, only provided on first sign-in)
 * @param {string} appleData.displayName - User display name (optional)
 * @returns {Object} User object and tokens
 */
const authenticateWithApple = async ({ appleId, email, displayName }) => {
  try {
    // Check if user exists with this Apple ID
    let user = await User.findOne({ appleId });

    if (!user) {
      // Check if user exists with this email (for account linking)
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
      }

      if (user) {
        // Link Apple ID to existing account
        user.appleId = appleId;
        user.authProvider = 'apple';
        await user.save();
        logger.info(`Apple ID linked to existing user: ${user.email}`);
      } else {
        // Create new user
        const userName = displayName || email?.split('@')[0] || 'Apple User';

        user = new User({
          email: email ? email.toLowerCase() : null,
          name: userName,
          authProvider: 'apple',
          appleId,
          password: null, // No password for OAuth users
        });

        await user.save();
        logger.info(`New user created with Apple Sign-In: ${appleId}`);

        // Create default preferences for the new user
        try {
          await UserPreferences.create({
            userId: user._id,
            notifications: true,
            language: 'en',
            saveChatHistory: true
          });
          logger.info(`Default preferences created for Apple user: ${appleId}`);
        } catch (prefError) {
          // Log error but don't fail authentication if preferences creation fails
          logger.error(`Failed to create default preferences for Apple user ${appleId}:`, prefError);
        }
      }
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('UNAUTHORIZED');
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    // Return user data
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
    logger.error('Error in Apple authentication:', error);
    throw error;
  }
};

/**
 * Authenticate or create user with Google Sign-In
 * iOS app handles authentication, we just receive the Google ID
 * @param {Object} googleData - Google authentication data from iOS
 * @param {string} googleData.googleId - Google user ID
 * @param {string} googleData.email - User email
 * @param {string} googleData.displayName - User display name
 * @param {string} googleData.photoURL - User photo URL (optional)
 * @returns {Object} User object and tokens
 */
const authenticateWithGoogle = async ({ googleId, email, displayName, photoURL }) => {
  try {
    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email (for account linking)
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
      }

      if (user) {
        // Link Google ID to existing account
        user.googleId = googleId;
        user.authProvider = 'google';
        if (photoURL && !user.avatar) {
          user.avatar = photoURL;
        }
        await user.save();
        logger.info(`Google ID linked to existing user: ${user.email}`);
      } else {
        // Create new user
        const userName = displayName || email?.split('@')[0] || 'Google User';

        user = new User({
          email: email ? email.toLowerCase() : null,
          name: userName,
          authProvider: 'google',
          googleId,
          avatar: photoURL || null,
          password: null, // No password for OAuth users
        });

        await user.save();
        logger.info(`New user created with Google Sign-In: ${googleId}`);

        // Create default preferences for the new user
        try {
          await UserPreferences.create({
            userId: user._id,
            notifications: true,
            language: 'en',
            saveChatHistory: true
          });
          logger.info(`Default preferences created for Google user: ${googleId}`);
        } catch (prefError) {
          // Log error but don't fail authentication if preferences creation fails
          logger.error(`Failed to create default preferences for Google user ${googleId}:`, prefError);
        }
      }
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('UNAUTHORIZED');
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    // Return user data
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
    logger.error('Error in Google authentication:', error);
    throw error;
  }
};

module.exports = {
  authenticateWithApple,
  authenticateWithGoogle,
};
