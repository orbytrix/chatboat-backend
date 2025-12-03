const Category = require('../models/Category');
const Character = require('../models/Character');
const { ErrorCodes } = require('../utils/responseFormatter');

/**
 * Create a new category
 * @param {Object} categoryData - Category data (name, description, icon)
 * @returns {Promise<Object>} Created category
 */
const createCategory = async (categoryData) => {
  try {
    const { name, description, icon } = categoryData;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      const error = new Error('Category with this name already exists');
      error.code = ErrorCodes.DUPLICATE_ENTRY;
      error.statusCode = 409;
      throw error;
    }

    const category = new Category({
      name,
      description,
      icon
    });

    await category.save();
    return category;
  } catch (error) {
    if (error.code === ErrorCodes.DUPLICATE_ENTRY) {
      throw error;
    }
    if (error.code === 11000) {
      const err = new Error('Category with this name already exists');
      err.code = ErrorCodes.DUPLICATE_ENTRY;
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

/**
 * Get all categories with character count
 * @param {Object} filters - Filter options (search)
 * @returns {Promise<Array>} Array of categories with character counts
 */
const getAllCategories = async (filters = {}) => {
  const { search } = filters;
  
  // Build query
  const query = {};
  
  // Search filter (case-insensitive search in name)
  if (search && search.trim() !== '') {
    query.name = { $regex: search.trim(), $options: 'i' };
  }
  
  const categories = await Category.find(query).sort({ name: 1 }).lean();

  // Get character count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const characterCount = await Character.countDocuments({ 
        categoryId: category._id 
      });
      
      return {
        ...category,
        characterCount
      };
    })
  );

  return categoriesWithCount;
};

/**
 * Get category by ID with characters
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Category with characters
 */
const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId).lean();

  if (!category) {
    const error = new Error('Category not found');
    error.code = ErrorCodes.NOT_FOUND;
    error.statusCode = 404;
    throw error;
  }

  // Get all characters in this category
  const characters = await Character.find({ categoryId })
    .populate('creatorId', 'name email')
    .sort({ popularity: -1, createdAt: -1 })
    .lean();

  return {
    ...category,
    characters
  };
};

/**
 * Update category
 * @param {string} categoryId - Category ID
 * @param {Object} updateData - Data to update (name, description, icon)
 * @returns {Promise<Object>} Updated category
 */
const updateCategory = async (categoryId, updateData) => {
  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      const error = new Error('Category not found');
      error.code = ErrorCodes.NOT_FOUND;
      error.statusCode = 404;
      throw error;
    }

    // Check if new name conflicts with existing category
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({ name: updateData.name });
      if (existingCategory) {
        const error = new Error('Category with this name already exists');
        error.code = ErrorCodes.DUPLICATE_ENTRY;
        error.statusCode = 409;
        throw error;
      }
    }

    // Update fields
    if (updateData.name !== undefined) category.name = updateData.name;
    if (updateData.description !== undefined) category.description = updateData.description;
    if (updateData.icon !== undefined) category.icon = updateData.icon;

    await category.save();
    return category;
  } catch (error) {
    if (error.code === ErrorCodes.DUPLICATE_ENTRY || error.code === ErrorCodes.NOT_FOUND) {
      throw error;
    }
    if (error.code === 11000) {
      const err = new Error('Category with this name already exists');
      err.code = ErrorCodes.DUPLICATE_ENTRY;
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
};

/**
 * Delete category
 * @param {string} categoryId - Category ID
 * @returns {Promise<void>}
 */
const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    const error = new Error('Category not found');
    error.code = ErrorCodes.NOT_FOUND;
    error.statusCode = 404;
    throw error;
  }

  // Check if category has characters
  const characterCount = await Character.countDocuments({ categoryId });
  if (characterCount > 0) {
    const error = new Error('Cannot delete category with existing characters');
    error.code = ErrorCodes.VALIDATION_ERROR;
    error.statusCode = 400;
    throw error;
  }

  await Category.findByIdAndDelete(categoryId);
};

/**
 * Search categories by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching categories with character counts
 */
const searchCategories = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return await getAllCategories();
    }
    
    return await getAllCategories({ search: searchTerm });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  searchCategories
};
