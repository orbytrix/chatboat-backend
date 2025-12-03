const characterService = require('../services/characterService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Create a new character
 * POST /api/characters
 */
const createCharacter = async (req, res) => {
  try {
    const userId = req.userId;
    const characterData = req.body;
    
    // Add Cloudinary data if file was uploaded
    if (req.cloudinaryResult) {
      characterData.avatar = req.cloudinaryResult.url;
      characterData.avatarPublicId = req.cloudinaryResult.publicId;
    }

    const character = await characterService.createCharacter(characterData, userId);

    logger.info(`Character created successfully: ${character._id}`);
    res.status(201).json(successResponse(character, 'Character created successfully'));
  } catch (error) {
    logger.error('Error in createCharacter controller:', error);
    
    const statusCode = error.statusCode || 500;
    const code = error.code || 'SERVER_ERROR';
    const message = error.message || 'Failed to create character';
    
    res.status(statusCode).json(errorResponse(code, message, error.details));
  }
};

/**
 * Get all characters with optional filtering
 * GET /api/characters?categoryId=xxx&search=xxx&page=1&limit=20
 */
const getAllCharacters = async (req, res) => {
  try {
    const userId = req.userId || null; // Optional auth
    const { categoryId, search, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (search) filters.search = search;

    const pagination = { page: parseInt(page), limit: parseInt(limit) };

    const result = await characterService.getAllCharacters(userId, filters, pagination);

    res.status(200).json(paginatedResponse(
      result.characters,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    ));
  } catch (error) {
    logger.error('Error in getAllCharacters controller:', error);
    
    const statusCode = error.statusCode || 500;
    const code = error.code || 'SERVER_ERROR';
    const message = error.message || 'Failed to retrieve characters';
    
    res.status(statusCode).json(errorResponse(code, message));
  }
};

/**
 * Get character by ID
 * GET /api/characters/:id
 */
const getCharacterById = async (req, res) => {
  try {
    const characterId = req.params.id;
    const userId = req.userId || null; // Optional auth

    const character = await characterService.getCharacterById(characterId, userId);

    res.status(200).json(successResponse(character));
  } catch (error) {
    logger.error('Error in getCharacterById controller:', error);
    
    const statusCode = error.statusCode || 500;
    const code = error.code || 'SERVER_ERROR';
    const message = error.message || 'Failed to retrieve character';
    
    res.status(statusCode).json(errorResponse(code, message));
  }
};

/**
 * Get user's created characters
 * GET /api/characters/my/created
 */
const getMyCharacters = async (req, res) => {
  try {
    const userId = req.userId;

    const characters = await characterService.getUserCreatedCharacters(userId);

    res.status(200).json(successResponse(characters));
  } catch (error) {
    logger.error('Error in getMyCharacters controller:', error);
    
    const statusCode = error.statusCode || 500;
    const code = error.code || 'SERVER_ERROR';
    const message = error.message || 'Failed to retrieve your characters';
    
    res.status(statusCode).json(errorResponse(code, message));
  }
};

/**
 * Update character
 * PUT /api/characters/:id
 */
const updateCharacter = async (req, res) => {
  try {
    const characterId = req.params.id;
    const updateData = req.body;
    const file = req.file;

    const character = await characterService.updateCharacter(characterId, updateData, file);

    logger.info(`Character updated successfully: ${characterId}`);
    res.status(200).json(successResponse(character, 'Character updated successfully'));
  } catch (error) {
    logger.error('Error in updateCharacter controller:', error);
    
    const statusCode = error.statusCode || 500;
    const code = error.code || 'SERVER_ERROR';
    const message = error.message || 'Failed to update character';
    
    res.status(statusCode).json(errorResponse(code, message));
  }
};

/**
 * Delete character
 * DELETE /api/characters/:id
 */
const deleteCharacter = async (req, res) => {
  try {
    const characterId = req.params.id;

    const result = await characterService.deleteCharacter(characterId);

    logger.info(`Character deleted successfully: ${characterId}`);
    res.status(200).json(successResponse(result, result.message));
  } catch (error) {
    logger.error('Error in deleteCharacter controller:', error);
    
    const statusCode = error.statusCode || 500;
    const code = error.code || 'SERVER_ERROR';
    const message = error.message || 'Failed to delete character';
    
    res.status(statusCode).json(errorResponse(code, message));
  }
};

/**
 * Search characters
 * GET /api/characters/search?q=xxx&categoryId=xxx&page=1&limit=20
 */
const searchCharacters = async (req, res) => {
  try {
    const userId = req.userId || null; // Optional auth
    const { q, categoryId, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (categoryId) filters.categoryId = categoryId;

    const pagination = { page: parseInt(page), limit: parseInt(limit) };

    const result = await characterService.searchCharacters(q || '', userId, filters, pagination);

    res.status(200).json(paginatedResponse(
      result.characters,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    ));
  } catch (error) {
    logger.error('Error in searchCharacters controller:', error);
    
    const statusCode = error.statusCode || 500;
    const code = error.code || 'SERVER_ERROR';
    const message = error.message || 'Failed to search characters';
    
    res.status(statusCode).json(errorResponse(code, message));
  }
};

module.exports = {
  createCharacter,
  getAllCharacters,
  getCharacterById,
  getMyCharacters,
  updateCharacter,
  deleteCharacter,
  searchCharacters
};
