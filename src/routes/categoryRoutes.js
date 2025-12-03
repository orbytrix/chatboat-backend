const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');

// Create a new category
router.post('/', authenticate, categoryController.createCategory);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Update category
router.put('/:id', authenticate, categoryController.updateCategory);

// Delete category
router.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = router;
