const Character = require('../models/Character');
const ChatSession = require('../models/ChatSession');
const Category = require('../models/Category');
const logger = require('../utils/logger');
const { deleteFromCloudinary, extractPublicId } = require('../middleware/uploadMiddleware');

/**
 * Create a new character
 * @param {Object} characterData - Character data (includes avatar URL and publicId from Cloudinary)
 * @param {string} userId - Creator user ID
 * @returns {Promise<Object>} Created character
 */
const createCharacter = async (characterData, userId) => {
  try {
    // Verify category exists
    const category = await Category.findById(characterData.categoryId);
    if (!category) {
      // Delete uploaded image from Cloudinary if category doesn't exist
      if (characterData.avatarPublicId) {
        try {
          await deleteFromCloudinary(characterData.avatarPublicId);
        } catch (deleteError) {
          logger.warn(`Failed to delete avatar from Cloudinary: ${deleteError.message}`);
        }
      }
      throw {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Category not found'
      };
    }

    // Validate avatar is provided
    if (!characterData.avatar) {
      throw {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Avatar is required for character creation'
      };
    }

    // Create character
    const character = new Character({
      name: characterData.name,
      avatar: characterData.avatar,
      avatarPublicId: characterData.avatarPublicId,
      prompt: characterData.prompt,
      categoryId: characterData.categoryId,
      creatorId: userId,
      isPublic: characterData.isPublic !== undefined ? characterData.isPublic : true,
      popularity: 0
    });

    await character.save();
    
    // Populate category and creator information
    await character.populate('categoryId', 'name description icon');
    await character.populate('creatorId', 'name email');

    logger.info(`Character created: ${character._id} by user ${userId}`);
    
    return character;
  } catch (error) {
    logger.error('Error creating character:', error);
    throw error;
  }
};

/**
 * Get all characters with visibility filtering
 * @param {string} userId - Optional user ID for filtering private characters
 * @param {Object} filters - Filter options (categoryId, search)
 * @param {Object} pagination - Pagination options (page, limit)
 * @returns {Promise<Object>} Characters and pagination info
 */
const getAllCharacters = async (userId = null, filters = {}, pagination = {}) => {
  try {
    const { categoryId, search } = filters;
    const { page = 1, limit = 20 } = pagination;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Visibility filtering: public characters + user's private characters
    if (userId) {
      query.$or = [
        { isPublic: true },
        { creatorId: userId }
      ];
    } else {
      query.isPublic = true;
    }
    
    // Category filter
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    // Search filter (case-insensitive search in name and prompt)
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { prompt: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Get total count for pagination
    const total = await Character.countDocuments(query);
    
    // Get characters with populated fields
    const characters = await Character.find(query)
      .populate('categoryId', 'name description icon')
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    logger.debug(`Retrieved ${characters.length} characters (page ${page})`);
    
    return {
      characters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting all characters:', error);
    throw error;
  }
};

/**
 * Get characters by category with filtering
 * @param {string} categoryId - Category ID
 * @param {string} userId - Optional user ID for filtering private characters
 * @param {Object} filters - Filter options (search)
 * @param {Object} pagination - Pagination options (page, limit)
 * @returns {Promise<Object>} Characters and pagination info
 */
const getCharactersByCategory = async (categoryId, userId = null, filters = {}, pagination = {}) => {
  try {
    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      throw {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Category not found'
      };
    }
    
    // Use getAllCharacters with category filter
    return await getAllCharacters(userId, { ...filters, categoryId }, pagination);
  } catch (error) {
    logger.error('Error getting characters by category:', error);
    throw error;
  }
};

/**
 * Get character by ID with access control
 * @param {string} characterId - Character ID
 * @param {string} userId - Optional user ID for access control
 * @returns {Promise<Object>} Character
 */
const getCharacterById = async (characterId, userId = null) => {
  try {
    const character = await Character.findById(characterId)
      .populate('categoryId', 'name description icon')
      .populate('creatorId', 'name email')
      .lean();
    
    if (!character) {
      throw {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Character not found'
      };
    }
    
    // Access control: private characters can only be viewed by creator
    if (!character.isPublic) {
      if (!userId || character.creatorId._id.toString() !== userId.toString()) {
        throw {
          statusCode: 403,
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to view this character'
        };
      }
    }
    
    // Get chat count for this character
    const chatCount = await ChatSession.countDocuments({ characterId });
    character.chatCount = chatCount;
    
    logger.debug(`Retrieved character: ${characterId}`);
    
    return character;
  } catch (error) {
    logger.error('Error getting character by ID:', error);
    throw error;
  }
};

/**
 * Get user's created characters
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's characters
 */
const getUserCreatedCharacters = async (userId) => {
  try {
    const characters = await Character.find({ creatorId: userId })
      .populate('categoryId', 'name description icon')
      .sort({ createdAt: -1 })
      .lean();
    
    // Add chat count for each character
    for (const character of characters) {
      const chatCount = await ChatSession.countDocuments({ characterId: character._id });
      character.chatCount = chatCount;
    }
    
    logger.debug(`Retrieved ${characters.length} characters for user ${userId}`);
    
    return characters;
  } catch (error) {
    logger.error('Error getting user created characters:', error);
    throw error;
  }
};

/**
 * Update character with ownership verification
 * @param {string} characterId - Character ID
 * @param {Object} updateData - Update data
 * @param {Object} file - Optional uploaded avatar file
 * @returns {Promise<Object>} Updated character
 */
const updateCharacter = async (characterId, updateData, file = null) => {
  try {
    const character = await Character.findById(characterId);
    
    if (!character) {
      if (file) {
        deleteUploadedFile(file.path);
      }
      throw {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Character not found'
      };
    }
    
    // If category is being updated, verify it exists
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        if (file) {
          deleteUploadedFile(file.path);
        }
        throw {
          statusCode: 404,
          code: 'NOT_FOUND',
          message: 'Category not found'
        };
      }
    }
    
    // Update fields
    if (updateData.name) character.name = updateData.name;
    if (updateData.prompt) character.prompt = updateData.prompt;
    if (updateData.categoryId) character.categoryId = updateData.categoryId;
    if (updateData.isPublic !== undefined) character.isPublic = updateData.isPublic;
    
    // Update avatar if new file uploaded
    if (file) {
      // Delete old avatar file
      if (character.avatar) {
        const oldAvatarPath = path.join(__dirname, '../../', character.avatar);
        deleteUploadedFile(oldAvatarPath);
      }
      character.avatar = getFileUrl(file.filename);
    }
    
    await character.save();
    
    // Populate fields
    await character.populate('categoryId', 'name description icon');
    await character.populate('creatorId', 'name email');
    
    logger.info(`Character updated: ${characterId}`);
    
    return character;
  } catch (error) {
    logger.error('Error updating character:', error);
    throw error;
  }
};

/**
 * Delete character with cascade deletion of chat sessions
 * @param {string} characterId - Character ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteCharacter = async (characterId) => {
  try {
    const character = await Character.findById(characterId);
    
    if (!character) {
      throw {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Character not found'
      };
    }
    
    // Delete avatar from Cloudinary
    if (character.avatar) {
      const publicId = character.avatarPublicId || extractPublicId(character.avatar);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          logger.info(`Character avatar deleted from Cloudinary: ${publicId}`);
        } catch (deleteError) {
          logger.warn(`Failed to delete character avatar from Cloudinary: ${deleteError.message}`);
          // Continue with deletion even if Cloudinary deletion fails
        }
      }
    }
    
    // Delete all chat sessions associated with this character
    const deletedSessions = await ChatSession.deleteMany({ characterId });
    logger.info(`Deleted ${deletedSessions.deletedCount} chat sessions for character ${characterId}`);
    
    // Delete character
    await Character.findByIdAndDelete(characterId);
    
    logger.info(`Character deleted: ${characterId}`);
    
    return {
      message: 'Character deleted successfully',
      deletedSessions: deletedSessions.deletedCount
    };
  } catch (error) {
    logger.error('Error deleting character:', error);
    throw error;
  }
};

/**
 * Search characters by name or prompt
 * @param {string} searchTerm - Search term
 * @param {string} userId - Optional user ID for filtering private characters
 * @param {Object} filters - Additional filters (categoryId)
 * @param {Object} pagination - Pagination options (page, limit)
 * @returns {Promise<Object>} Search results and pagination info
 */
const searchCharacters = async (searchTerm, userId = null, filters = {}, pagination = {}) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return await getAllCharacters(userId, filters, pagination);
    }
    
    return await getAllCharacters(userId, { ...filters, search: searchTerm }, pagination);
  } catch (error) {
    logger.error('Error searching characters:', error);
    throw error;
  }
};

module.exports = {
  createCharacter,
  getAllCharacters,
  getCharactersByCategory,
  getCharacterById,
  getUserCreatedCharacters,
  updateCharacter,
  deleteCharacter,
  searchCharacters
};
