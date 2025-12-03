const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chatbot Backend API',
      version: '1.0.0',
      description: 'Node.js backend API for iOS chatbot application with AI-powered characters. This API provides endpoints for user authentication, profile management, category and character management, AI-powered chat using OpenRouter API, and analytics tracking.',
      contact: {
        name: 'API Support',
        email: 'support@chatbot-api.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.chatbot-app.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'UNAUTHORIZED'
                      },
                      message: {
                        type: 'string',
                        example: 'Authentication required'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Input validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'VALIDATION_ERROR'
                      },
                      message: {
                        type: 'string',
                        example: 'Validation failed'
                      },
                      details: {
                        type: 'object'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'NOT_FOUND'
                      },
                      message: {
                        type: 'string',
                        example: 'Resource not found'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'SERVER_ERROR'
                      },
                      message: {
                        type: 'string',
                        example: 'Internal server error'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User profile management endpoints'
      },
      {
        name: 'Categories',
        description: 'Category management endpoints'
      },
      {
        name: 'Characters',
        description: 'Character management endpoints'
      },
      {
        name: 'Chat',
        description: 'Chat session and messaging endpoints'
      },
      {
        name: 'Favorites',
        description: 'Character favorites and recommendations endpoints'
      },
      {
        name: 'Preferences',
        description: 'User preferences and settings endpoints'
      },
      {
        name: 'Analytics',
        description: 'Analytics and usage tracking endpoints (Admin only)'
      }
    ]
  },
  apis: ['./src/routes/*.js', './swagger/schemas/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
