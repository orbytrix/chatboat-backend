const logger = require('../utils/logger');

/**
 * NVIDIA API Configuration
 */
const nvidiaConfig = {
  apiKey: process.env.NVIDIA_API_KEY,
  apiUrl: process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions',
  timeout: 30000, // 30 seconds
  model: 'meta/llama-3.1-8b-instruct', // Default model
  maxTokens: 1024,
  temperature: 0.7,
};

/**
 * Validate NVIDIA configuration
 * @throws {Error} If configuration is invalid
 */
const validateConfig = () => {
  if (!nvidiaConfig.apiKey) {
    logger.error('NVIDIA API key is not configured');
    throw new Error('NVIDIA_API_KEY environment variable is required');
  }

  if (!nvidiaConfig.apiUrl) {
    logger.error('NVIDIA API URL is not configured');
    throw new Error('NVIDIA_API_URL environment variable is required');
  }

  logger.info('NVIDIA API configuration validated successfully');
};

module.exports = {
  nvidiaConfig,
  validateConfig,
};
