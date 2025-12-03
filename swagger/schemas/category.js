/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Category ID
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Category name
 *           example: "Fantasy"
 *         description:
 *           type: string
 *           description: Category description
 *           example: "Fantasy and magical characters"
 *         icon:
 *           type: string
 *           description: Category icon identifier
 *           example: "fantasy-icon"
 *         characterCount:
 *           type: number
 *           description: Number of characters in this category
 *           example: 15
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Category creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Fantasy"
 *         description:
 *           type: string
 *           example: "Fantasy and magical characters"
 *         icon:
 *           type: string
 *           example: "fantasy-icon"
 *     
 *     UpdateCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Fantasy & Magic"
 *         description:
 *           type: string
 *           example: "Updated description"
 *         icon:
 *           type: string
 *           example: "new-icon"
 *     
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Category'
 *     
 *     CategoriesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 */

module.exports = {};
