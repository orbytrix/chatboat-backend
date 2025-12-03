/**
 * @swagger
 * components:
 *   schemas:
 *     UserPreferences:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID
 *           example: "507f1f77bcf86cd799439011"
 *         notifications:
 *           type: boolean
 *           description: Enable/disable notifications
 *           example: true
 *         language:
 *           type: string
 *           description: Preferred language code
 *           example: "en"
 *         saveChatHistory:
 *           type: boolean
 *           description: Enable/disable chat history saving
 *           example: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     UpdatePreferencesRequest:
 *       type: object
 *       properties:
 *         notifications:
 *           type: boolean
 *           example: false
 *         language:
 *           type: string
 *           example: "es"
 *         saveChatHistory:
 *           type: boolean
 *           example: false
 *     
 *     PreferencesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/UserPreferences'
 */

module.exports = {};
