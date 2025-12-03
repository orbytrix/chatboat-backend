const logger = require('../utils/logger');

/**
 * OpenRouter API Configuration
 */
const openRouterConfig = {
  apiKey: process.env.OPENROUTER_API_KEY,
  apiUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
  siteUrl: process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
  siteName: process.env.OPENROUTER_SITE_NAME || 'Chatbot Backend API',
  model: 'openai/gpt-4o-mini', // Default model (cost-effective)
  timeout: 30000, // 30 seconds
  temperature: 0.7,
  maxTokens: 1024,
};

/**
 * Validate OpenRouter configuration
 * @throws {Error} If configuration is invalid
 */
const validateConfig = () => {
  if (!openRouterConfig.apiKey) {
    logger.error('OpenRouter API key is not configured');
    throw new Error('OPENROUTER_API_KEY environment variable is required');
  }

  if (!openRouterConfig.apiUrl) {
    logger.error('OpenRouter API URL is not configured');
    throw new Error('OPENROUTER_API_URL environment variable is required');
  }

  logger.info('OpenRouter API configuration validated successfully');
};

module.exports = {
  openRouterConfig,
  validateConfig,
};
