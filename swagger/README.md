# Swagger API Documentation

This directory contains the Swagger/OpenAPI documentation configuration for the Chatbot Backend API.

## Structure

- `swagger.js` - Main Swagger configuration file with API info, servers, security schemes, and tags
- `schemas/` - Directory containing all API schema definitions organized by domain

## Accessing the Documentation

Once the server is running, you can access the Swagger documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs.json`

## Features

- **Interactive API Testing**: Try out API endpoints directly from the Swagger UI
- **Authentication Support**: Use the "Authorize" button to add your JWT Bearer token
- **Request/Response Examples**: All endpoints include example requests and responses
- **Schema Validation**: All data models are fully documented with validation rules
- **Error Responses**: Standardized error response formats for all endpoints

## Authentication

Most endpoints require authentication. To test protected endpoints:

1. First, call the `/api/auth/register` or `/api/auth/login` endpoint
2. Copy the `accessToken` from the response
3. Click the "Authorize" button at the top of the Swagger UI
4. Enter: `Bearer <your-access-token>`
5. Click "Authorize" and then "Close"
6. Now you can test protected endpoints

## Schema Files

- `user.js` - User authentication and profile schemas
- `category.js` - Category management schemas
- `character.js` - Character management schemas
- `chat.js` - Chat session and messaging schemas
- `favorite.js` - Favorites and recommendations schemas
- `preferences.js` - User preferences schemas
- `analytics.js` - Analytics and statistics schemas
- `common.js` - Common schemas used across multiple endpoints

## Adding New Endpoints

When adding new endpoints to the API:

1. Add JSDoc Swagger annotations to the route file in `src/routes/`
2. Define any new schemas in the appropriate file in `swagger/schemas/`
3. The Swagger spec will automatically pick up the changes on server restart

## Example Annotation

```javascript
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Example endpoint
 *     description: Detailed description of what this endpoint does
 *     tags: [ExampleTag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExampleSchema'
 */
```

## Requirements Covered

This Swagger documentation implementation satisfies:
- Requirement 6.1: Swagger documentation accessible at dedicated endpoint
- Requirement 6.2: All endpoints documented with parameters, responses, and authentication
- Requirement 6.3: Example requests and responses included
- Requirement 6.4: Interactive API documentation interface
