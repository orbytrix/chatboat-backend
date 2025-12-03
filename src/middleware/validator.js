const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Sanitize string to prevent NoSQL injection
 * Removes MongoDB operators and special characters
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove MongoDB operators
  return str.replace(/[${}]/g, '');
};

/**
 * Recursively sanitize object to prevent NoSQL injection
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      // Skip MongoDB operators in keys
      if (key.startsWith('$')) continue;
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Middleware factory to validate request data against Joi schema
 * @param {Object} schema - Joi schema object with optional body, query, params
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
      errors: {
        wrap: {
          label: ''
        }
      }
    };

    const toValidate = {};
    
    if (schema.body) toValidate.body = req.body;
    if (schema.query) toValidate.query = req.query;
    if (schema.params) toValidate.params = req.params;

    const validationSchema = Joi.object(schema);
    const { error, value } = validationSchema.validate(toValidate, validationOptions);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error:', { errors, path: req.path });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors
        }
      });
    }

    // Sanitize validated data to prevent NoSQL injection
    if (value.body) req.body = sanitizeObject(value.body);
    if (value.query) req.query = sanitizeObject(value.query);
    if (value.params) req.params = sanitizeObject(value.params);

    next();
  };
};

// Common validation schemas
const schemas = {
  // Authentication schemas
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
      name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      })
    })
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  },

  appleSignIn: {
    body: Joi.object({
      identityToken: Joi.string().required(),
      user: Joi.object({
        email: Joi.string().email(),
        name: Joi.string()
      }).optional()
    })
  },

  googleSignIn: {
    body: Joi.object({
      idToken: Joi.string().required()
    })
  },

  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required()
    })
  },

  logout: {
    body: Joi.object({
      refreshToken: Joi.string().required()
    })
  },

  // User profile schemas
  updateProfile: {
    body: Joi.object({
      name: Joi.string().min(2).max(100),
      email: Joi.string().email()
    }).min(1)
  },

  // Category schemas
  createCategory: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(500).optional(),
      icon: Joi.string().max(200).optional()
    })
  },

  updateCategory: {
    body: Joi.object({
      name: Joi.string().min(2).max(100),
      description: Joi.string().max(500),
      icon: Joi.string().max(200)
    }).min(1)
  },

  // Character schemas
  createCharacter: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      prompt: Joi.string().min(10).max(5000).required().messages({
        'string.min': 'Prompt must be at least 10 characters long',
        'string.max': 'Prompt cannot exceed 5000 characters',
        'any.required': 'Prompt is required'
      }),
      categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'Invalid category ID format'
      }),
      isPublic: Joi.boolean().default(true)
    })
  },

  updateCharacter: {
    body: Joi.object({
      name: Joi.string().min(2).max(100),
      prompt: Joi.string().min(10).max(5000),
      categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      isPublic: Joi.boolean()
    }).min(1)
  },

  getCharacters: {
    query: Joi.object({
      categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      search: Joi.string().max(200),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  },

  // Chat schemas
  startChatSession: {
    body: Joi.object({
      characterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    })
  },

  sendMessage: {
    body: Joi.object({
      characterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
      message: Joi.string().min(1).max(2000).required().messages({
        'string.max': 'Message cannot exceed 2000 characters'
      })
    })
  },

  getChatSessions: {
    query: Joi.object({
      characterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
    })
  },

  // Favorite schemas
  addFavorite: {
    body: Joi.object({
      characterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    })
  },

  // Preferences schemas
  updatePreferences: {
    body: Joi.object({
      notifications: Joi.boolean(),
      language: Joi.string().valid('en', 'es', 'fr', 'de', 'zh', 'ja'),
      saveChatHistory: Joi.boolean()
    }).min(1)
  },

  // Common parameter schemas
  mongoId: {
    params: Joi.object({
      id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'Invalid ID format'
      })
    })
  },

  characterId: {
    params: Joi.object({
      characterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    })
  }
};

module.exports = {
  validate,
  schemas,
  sanitizeString,
  sanitizeObject
};
