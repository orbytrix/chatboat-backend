/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         favoriteId:
 *           type: string
 *           description: Favorite ID
 *           example: "507f1f77bcf86cd799439011"
 *         userId:
 *           type: string
 *           description: User ID
 *           example: "507f1f77bcf86cd799439012"
 *         characterId:
 *           type: string
 *           description: Character ID
 *           example: "507f1f77bcf86cd799439013"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Favorite creation timestamp
 *     
 *     AddFavoriteRequest:
 *       type: object
 *       required:
 *         - characterId
 *       properties:
 *         characterId:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *     
 *     FavoriteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Favorite'
 *     
 *     FavoriteCharactersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Character'
 *     
 *     RecommendationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Character'
 */

module.exports = {};
