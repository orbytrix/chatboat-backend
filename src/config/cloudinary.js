const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

/**
 * Cloudinary Configuration
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Validate Cloudinary configuration
 * @returns {boolean} True if configuration is valid
 */
const validateCloudinaryConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.warn(`Cloudinary configuration incomplete. Missing: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

/**
 * Check if Cloudinary is enabled
 * @returns {boolean} True if Cloudinary is properly configured
 */
const isCloudinaryEnabled = () => {
  return validateCloudinaryConfig();
};

/**
 * Log Cloudinary configuration status on startup
 */
const logCloudinaryStatus = () => {
  if (isCloudinaryEnabled()) {
    logger.info(`Cloudinary: Enabled (Cloud: ${process.env.CLOUDINARY_CLOUD_NAME})`);
  } else {
    logger.warn('Cloudinary: Disabled (missing configuration) - Image uploads will fail');
  }
};

module.exports = {
  cloudinary,
  validateCloudinaryConfig,
  isCloudinaryEnabled,
  logCloudinaryStatus
};
