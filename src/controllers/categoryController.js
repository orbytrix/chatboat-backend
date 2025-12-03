const categoryService = require('../services/categoryService');
const { successResponse, errorResponse, ErrorCodes } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Create a new category
 * @route POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Category name is required')
      );
    }

    const category = await categoryService.createCategory({
      name: name.trim(),
      description: description?.trim() || '',
      icon: icon || null
    });

    logger.info(`Category created: ${category._id} by user: ${req.user.id}`);
    
    res.status(201).json(
      successResponse(category, 'Category created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories with character count
 * @route GET /api/categories?search=term
 */
const getAllCategories = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    const filters = {};
    if (search) {
      filters.search = search;
    }
    
    const categories = await categoryService.getAllCategories(filters);
    
    res.status(200).json(successResponse(categories));
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID with characters
 * @route GET /api/categories/:id
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id);
    
    res.status(200).json(successResponse(category));
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * @route PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (icon !== undefined) updateData.icon = icon;

    const category = await categoryService.updateCategory(id, updateData);

    logger.info(`Category updated: ${id} by user: ${req.user.id}`);
    
    res.status(200).json(
      successResponse(category, 'Category updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 * @route DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    await categoryService.deleteCategory(id);

    logger.info(`Category deleted: ${id} by user: ${req.user.id}`);
    
    res.status(200).json(
      successResponse(null, 'Category deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
