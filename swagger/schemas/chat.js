/**
 * @swagger
 * components:
 *   schemas:
 *     ChatSession:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *           description: Chat session ID
 *           example: "507f1f77bcf86cd799439011"
 *         userId:
 *           type: string
 *           description: User ID
 *           example: "507f1f77bcf86cd799439012"
 *         characterId:
 *           type: string
 *           description: Character ID
 *           example: "507f1f77bcf86cd799439013"
 *         characterName:
 *           type: string
 *           description: Character name
 *           example: "Wizard Merlin"
 *         characterAvatar:
 *           type: string
 *           description: Character avatar URL
 *           example: "https://example.com/avatars/merlin.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Session creation timestamp
 *     
 *     StartChatRequest:
 *       type: object
 *       required:
 *         - characterId
 *       properties:
 *         characterId:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *     
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - characterId
 *         - message
 *       properties:
 *         characterId:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         message:
 *           type: string
 *           example: "Hello, can you help me with a quest?"
 *     
 *     MessageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             response:
 *               type: string
 *               example: "Greetings, young adventurer! I sense great potential in you..."
 *             characterName:
 *               type: string
 *               example: "Wizard Merlin"
 *             timestamp:
 *               type: string
 *               format: date-time
 *     
 *     ChatSessionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/ChatSession'
 *     
 *     ChatSessionsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatSession'
 *     
 *     SessionCountResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             totalSessions:
 *               type: number
 *               example: 25
 */

module.exports = {};
