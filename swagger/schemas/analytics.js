/**
 * @swagger
 * components:
 *   schemas:
 *     CharacterStatistics:
 *       type: object
 *       properties:
 *         characterId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         characterName:
 *           type: string
 *           example: "Wizard Merlin"
 *         sessionCount:
 *           type: number
 *           description: Total number of chat sessions
 *           example: 150
 *         popularity:
 *           type: number
 *           description: Popularity score
 *           example: 42
 *     
 *     CategoryPopularity:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         categoryName:
 *           type: string
 *           example: "Fantasy"
 *         characterCount:
 *           type: number
 *           description: Number of characters in category
 *           example: 25
 *         totalChats:
 *           type: number
 *           description: Total chat sessions across all characters
 *           example: 500
 *     
 *     UserEngagement:
 *       type: object
 *       properties:
 *         activeUsers:
 *           type: number
 *           description: Number of active users
 *           example: 1250
 *         totalUsers:
 *           type: number
 *           description: Total registered users
 *           example: 5000
 *         averageSessionDuration:
 *           type: number
 *           description: Average session duration in minutes
 *           example: 15.5
 *     
 *     CharacterStatisticsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CharacterStatistics'
 *     
 *     CategoryPopularityResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategoryPopularity'
 *     
 *     UserEngagementResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/UserEngagement'
 */

module.exports = {};
