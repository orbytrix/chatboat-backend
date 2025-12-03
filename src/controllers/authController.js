const authService = require('../services/authService');
const oauthService = require('../services/oauthService');
const tokenBlacklist = require('../utils/tokenBlacklist');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookieHelper');
const logger = require('../utils/logger');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, and name are required',
        },
      });
    }

    // Register user
    const result = await authService.register({ email, password, name });

    // Set authentication cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === 'DUPLICATE_ENTRY') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'User with this email already exists',
        },
      });
    }
    next(error);
  }
};

/**
 * Login with email and password
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    // Login user
    const result = await authService.login({ email, password });

    // Set authentication cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === 'AUTH_FAILED') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Invalid email or password',
        },
      });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Account is inactive',
        },
      });
    }
    next(error);
  }
};

/**
 * Authenticate with Apple Sign-In
 * POST /api/auth/apple
 * iOS app handles authentication, backend just receives user data
 */
const appleSignIn = async (req, res, next) => {
  try {
    const { appleId, email, displayName } = req.body;

    // Validate required fields
    if (!appleId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Apple ID is required',
          details: [{ field: 'appleId', message: 'Apple ID is required' }]
        },
      });
    }

    // Authenticate or create user with Apple ID
    const result = await oauthService.authenticateWithApple({
      appleId,
      email,
      displayName,
    });

    // Set authentication cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Account is inactive',
        },
      });
    }
    next(error);
  }
};

/**
 * Authenticate with Google Sign-In
 * POST /api/auth/google
 * iOS app handles authentication, backend just receives user data
 */
const googleSignIn = async (req, res, next) => {
  try {
    const { googleId, email, displayName, photoURL } = req.body;

    // Validate required fields
    if (!googleId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Google ID is required',
          details: [{ field: 'googleId', message: 'Google ID is required' }]
        },
      });
    }

    // Authenticate or create user with Google ID
    const result = await oauthService.authenticateWithGoogle({
      googleId,
      email,
      displayName,
      photoURL,
    });

    // Set authentication cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Account is inactive',
        },
      });
    }
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    // Get refresh token from body or cookie
    let refreshToken = req.body.refreshToken;
    if (!refreshToken && req.cookies) {
      refreshToken = req.cookies.refreshToken;
    }

    // Validate required fields
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      });
    }

    // Refresh tokens
    const result = await authService.refreshAccessToken(refreshToken);

    // Set new access token cookie
    setAuthCookies(res, result.accessToken, refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Refresh token has expired',
        },
      });
    }
    if (error.message === 'TOKEN_INVALID') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid refresh token',
        },
      });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User account is inactive',
        },
      });
    }
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // Get refresh token from body or cookie
    let refreshToken = req.body.refreshToken;
    if (!refreshToken && req.cookies) {
      refreshToken = req.cookies.refreshToken;
    }
    
    const userId = req.userId; // From auth middleware

    // Validate required fields
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      });
    }

    // Add access token to blacklist
    const accessToken = req.token; // From auth middleware
    if (accessToken) {
      // Decode token to get expiration
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        tokenBlacklist.add(accessToken, expiresAt);
        logger.debug(`Access token blacklisted for user: ${userId}`);
      }
    }

    // Invalidate refresh token
    await authService.logout(refreshToken, userId);

    // Clear authentication cookies
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  appleSignIn,
  googleSignIn,
  refreshToken,
  logout,
};
