const logger = require('../utils/logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message
  }));

  return {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid data provided',
    details: errors
  };
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[field];
  
  return {
    statusCode: 409,
    code: 'DUPLICATE_ENTRY',
    message: `${field} '${value}' already exists`,
    details: [{ field, message: `This ${field} is already in use` }]
  };
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleCastError = (err) => {
  return {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: `Invalid ${err.path}: ${err.value}`,
    details: [{ field: err.path, message: 'Invalid ID format' }]
  };
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return {
    statusCode: 401,
    code: 'TOKEN_INVALID',
    message: 'Invalid token. Please login again.'
  };
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return {
    statusCode: 401,
    code: 'TOKEN_EXPIRED',
    message: 'Token has expired. Please login again.'
  };
};

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'File size too large. Maximum size is 5MB.'
    };
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Too many files uploaded'
    };
  }
  
  return {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: err.message
  };
};

/**
 * Not found error handler
 * Catches all requests to undefined routes
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Global error handling middleware
 * Must be defined after all routes
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error details
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.userId || 'unauthenticated',
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationError = handleValidationError(err);
    return res.status(validationError.statusCode).json({
      success: false,
      error: {
        code: validationError.code,
        message: validationError.message,
        details: validationError.details
      }
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const duplicateError = handleDuplicateKeyError(err);
    return res.status(duplicateError.statusCode).json({
      success: false,
      error: {
        code: duplicateError.code,
        message: duplicateError.message,
        details: duplicateError.details
      }
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const castError = handleCastError(err);
    return res.status(castError.statusCode).json({
      success: false,
      error: {
        code: castError.code,
        message: castError.message,
        details: castError.details
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const jwtError = handleJWTError();
    return res.status(jwtError.statusCode).json({
      success: false,
      error: {
        code: jwtError.code,
        message: jwtError.message
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    const expiredError = handleJWTExpiredError();
    return res.status(expiredError.statusCode).json({
      success: false,
      error: {
        code: expiredError.code,
        message: expiredError.message
      }
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    const multerError = handleMulterError(err);
    return res.status(multerError.statusCode).json({
      success: false,
      error: {
        code: multerError.code,
        message: multerError.message
      }
    });
  }

  // Operational errors (custom AppError)
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: {
        code: err.code || 'SERVER_ERROR',
        message: err.message,
        ...(err.details && { details: err.details })
      }
    });
  }

  // Programming or unknown errors
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'SERVER_ERROR';
  const message = err.message || 'Internal server error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      // Include stack trace in development mode
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @returns {AppError} Custom error instance
 */
const createError = (message, statusCode = 500, code = 'SERVER_ERROR') => {
  return new AppError(message, statusCode, code);
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
  createError
};
