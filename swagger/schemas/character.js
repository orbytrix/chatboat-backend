/**
 * @swagger
 * components:
 *   schemas:
 *     Character:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Character ID
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Character name
 *           example: "Wizard Merlin"
 *         avatar:
 *           type: string
 *           description: URL to character avatar image
 *           example: "https://example.com/avatars/merlin.jpg"
 *         prompt:
 *           type: string
 *           description: Character personality and behavior prompt (max 5000 characters)
 *           example: "You are a wise and ancient wizard who speaks in riddles..."
 *         categoryId:
 *           type: string
 *           description: Category ID this character belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         creatorId:
 *           type: string
 *           description: User ID of the character creator
 *           example: "507f1f77bcf86cd799439013"
 *         creator:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             avatar:
 *               type: string
 *         isPublic:
 *           type: boolean
 *           description: Whether the character is publicly visible
 *           example: true
 *         popularity:
 *           type: number
 *           description: Character popularity score based on chat sessions
 *           example: 42
 *         chatCount:
 *           type: number
 *           description: Total number of chat sessions with this character
 *           example: 150
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Character creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     CreateCharacterRequest:
 *       type: object
 *       required:
 *         - name
 *         - avatar
 *         - prompt
 *         - categoryId
 *       properties:
 *         name:
 *           type: string
 *           example: "Wizard Merlin"
 *         avatar:
 *           type: string
 *           format: binary
 *           description: Character avatar image file
 *         prompt:
 *           type: string
 *           maxLength: 5000
 *           example: "You are a wise and ancient wizard..."
 *         categoryId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         isPublic:
 *           type: boolean
 *           example: true
 *     
 *     UpdateCharacterRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Grand Wizard Merlin"
 *         avatar:
 *           type: string
 *           format: binary
 *           description: New character avatar image file
 *         prompt:
 *           type: string
 *           maxLength: 5000
 *           example: "Updated personality prompt..."
 *         categoryId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         isPublic:
 *           type: boolean
 *           example: false
 *     
 *     CharacterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Character'
 *     
 *     CharactersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             characters:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Character'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                   example: 1
 *                 limit:
 *                   type: number
 *                   example: 20
 *                 total:
 *                   type: number
 *                   example: 100
 *                 pages:
 *                   type: number
 *                   example: 5
 */

module.exports = {};
