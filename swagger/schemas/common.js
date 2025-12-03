/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "ERROR_CODE"
 *             message:
 *               type: string
 *               example: "Error message description"
 *             details:
 *               type: object
 *               description: Additional error details (optional)
 *     
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             refreshToken:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     
 *     AppleSignInRequest:
 *       type: object
 *       required:
 *         - identityToken
 *       properties:
 *         identityToken:
 *           type: string
 *           example: "eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ..."
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: "user@privaterelay.appleid.com"
 *             name:
 *               type: string
 *               example: "John Doe"
 *     
 *     GoogleSignInRequest:
 *       type: object
 *       required:
 *         - idToken
 *       properties:
 *         idToken:
 *           type: string
 *           example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU0NTBhM..."
 *     
 *     LogoutRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

module.exports = {};
