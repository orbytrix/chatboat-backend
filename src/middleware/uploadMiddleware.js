const multer = require('multer');
const path = require('path');
const { cloudinary, isCloudinaryEnabled } = require('../config/cloudinary');
const logger = require('../utils/logger');

/**
 * Configure multer to use memory storage for Cloudinary uploads
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
  // Allowed image mime types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // Allowed file extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    logger.debug(`File upload accepted: ${file.originalname}`);
    cb(null, true);
  } else {
    logger.warn(`File upload rejected: ${file.originalname} (type: ${mimeType})`);
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

/**
 * Multer configuration for avatar uploads
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only one file per request
  }
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'avatars', publicId = null) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryEnabled()) {
      return reject(new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file'));
    }

    const uploadOptions = {
      folder: process.env.CLOUDINARY_FOLDER || folder,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' }, // Limit max dimensions
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' } // Auto format selection (WebP when supported)
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          logger.debug(`Image uploaded to Cloudinary: ${result.public_id}`);
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Middleware to handle avatar upload for user profiles
 */
const uploadAvatar = (req, res, next) => {
  const uploadSingle = upload.single('avatar');
  
  uploadSingle(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      logger.warn(`Multer error during upload: ${err.message}`);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File size too large. Maximum size is 5MB.',
            details: [{ field: 'avatar', message: 'File exceeds 5MB limit' }]
          }
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Too many files. Only one file allowed.',
            details: [{ field: 'avatar', message: 'Only one file allowed' }]
          }
        });
      }
      
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Unexpected field name. Use "avatar" as the field name.',
            details: [{ field: 'avatar', message: 'Invalid field name' }]
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    } else if (err) {
      // Other errors (e.g., file type validation)
      logger.error(`Upload error: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message,
          details: [{ field: 'avatar', message: err.message }]
        }
      });
    }
    
    // Upload to Cloudinary if file was uploaded
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'avatars');
        
        // Attach Cloudinary result to request
        req.cloudinaryResult = {
          url: result.secure_url,
          publicId: result.public_id
        };
        
        logger.info(`Avatar uploaded successfully: ${result.public_id}`);
        next();
      } catch (uploadError) {
        logger.error('Failed to upload to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          error: {
            code: 'FILE_UPLOAD_ERROR',
            message: uploadError.message || 'Failed to upload image to cloud storage',
            details: [{ field: 'avatar', message: 'Upload failed' }]
          }
        });
      }
    } else {
      next();
    }
  });
};

/**
 * Middleware to handle character avatar upload
 */
const uploadCharacterAvatar = (req, res, next) => {
  const uploadSingle = upload.single('avatar');
  
  uploadSingle(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      logger.warn(`Multer error during character avatar upload: ${err.message}`);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File size too large. Maximum size is 5MB.'
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    } else if (err) {
      logger.error(`Character avatar upload error: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    }
    
    // Avatar is required for character creation
    if (!req.file && req.method === 'POST') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Avatar image is required for character creation',
          details: [{ field: 'avatar', message: 'Avatar is required' }]
        }
      });
    }
    
    // Upload to Cloudinary if file was uploaded
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'characters');
        
        // Attach Cloudinary result to request
        req.cloudinaryResult = {
          url: result.secure_url,
          publicId: result.public_id
        };
        
        logger.info(`Character avatar uploaded successfully: ${result.public_id}`);
        next();
      } catch (uploadError) {
        logger.error('Failed to upload character avatar to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          error: {
            code: 'FILE_UPLOAD_ERROR',
            message: uploadError.message || 'Failed to upload image to cloud storage',
            details: [{ field: 'avatar', message: 'Upload failed' }]
          }
        });
      }
    } else {
      next();
    }
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!isCloudinaryEnabled()) {
      logger.warn('Cloudinary is not configured. Cannot delete image.');
      return { result: 'not_configured' };
    }

    if (!publicId) {
      logger.warn('No public ID provided for deletion');
      return { result: 'no_public_id' };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    logger.debug(`Image deleted from Cloudinary: ${publicId}, result: ${result.result}`);
    return result;
  } catch (error) {
    logger.error(`Error deleting image from Cloudinary (${publicId}):`, error);
    throw error;
  }
};

/**
 * Extract Cloudinary public ID from URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null
 */
const extractPublicId = (url) => {
  if (!url) return null;
  
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch (error) {
    logger.error('Error extracting public ID from URL:', error);
    return null;
  }
};

module.exports = {
  uploadAvatar,
  uploadCharacterAvatar,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId
};
