# Chatbot Backend API

A comprehensive Node.js backend API system that powers an iOS chatbot application with AI-powered character interactions. Built with Express.js, MongoDB, and OpenRouter AI integration.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [API Documentation](#api-documentation)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)
- [Testing](#testing)
- [Security](#security)
- [License](#license)

## Features

- **Authentication & Authorization**
  - Email/Password registration and login
  - Apple Sign-In integration
  - Google Sign-In integration
  - JWT-based authentication with refresh tokens
  - Token blacklisting for logout functionality

- **User Management**
  - User profile management with avatar upload
  - Account deletion with cascade cleanup
  - User preferences and settings

- **Character System**
  - Create and manage AI characters with custom prompts
  - Character categorization
  - Public/private character visibility
  - Character search and filtering
  - User-created custom characters

- **AI-Powered Chat**
  - Real-time chat with AI characters using OpenRouter API
  - Character personality-based responses
  - Chat session tracking
  - 30-second timeout handling

- **Social Features**
  - Favorite characters
  - Personalized character recommendations
  - Character popularity tracking

- **Analytics & Monitoring**
  - Character usage statistics
  - Category popularity metrics
  - User engagement tracking
  - Comprehensive logging with Winston

- **Security**
  - Helmet.js for security headers
  - Rate limiting on all endpoints
  - Input validation and sanitization
  - CORS configuration
  - Password encryption

- **Documentation**
  - Interactive Swagger/OpenAPI documentation
  - Health check endpoint

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

You'll also need accounts and API keys for:

- **OpenRouter API** (required) - Get your API key from [https://openrouter.ai](https://openrouter.ai)
- **Cloudinary Account** (required for image uploads) - Sign up at [https://cloudinary.com](https://cloudinary.com)

**Note**: Apple Sign-In and Google Sign-In are handled by the iOS app. No backend configuration needed!

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbot-backend-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file** (see [Environment Variables](#environment-variables) section)

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

6. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Server Configuration
```env
NODE_ENV=development          # Environment: development, production
PORT=3000                     # Server port
```

### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/chatbot-db  # MongoDB connection string
```

### JWT Configuration
```env
JWT_SECRET=your-jwt-secret-key-here                    # Secret for access tokens
JWT_EXPIRES_IN=1h                                      # Access token expiration
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here    # Secret for refresh tokens
REFRESH_TOKEN_EXPIRES_IN=7d                            # Refresh token expiration
```

### OpenRouter API Configuration
```env
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here         # Your OpenRouter API key
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_SITE_URL=http://localhost:3000             # Your site URL
OPENROUTER_SITE_NAME=Chatbot Backend API              # Your site name
```

### Apple Sign-In & Google Sign-In
OAuth authentication is handled entirely by the iOS app. The backend only receives and stores the user's Apple ID or Google ID. No backend configuration is required!

The iOS app will:
1. Handle the OAuth flow with Apple/Google
2. Receive the user ID and profile information
3. Send this data to the backend API
4. Backend creates or links the user account

**No environment variables needed for OAuth!**

### Cloudinary Configuration (Required for image uploads)
To set up Cloudinary for avatar storage:
1. Sign up for a free account at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard to find your credentials
3. Copy Cloud Name, API Key, and API Secret

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name      # Your Cloudinary cloud name
CLOUDINARY_API_KEY=your-api-key            # Your Cloudinary API key
CLOUDINARY_API_SECRET=your-api-secret      # Your Cloudinary API secret
CLOUDINARY_FOLDER=chatbot-avatars          # Folder name for organizing uploads
```

### Logging Configuration
```env
LOG_LEVEL=info    # Logging level: error, warn, info, debug
```

### CORS Configuration (Optional)
```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com  # Comma-separated allowed origins
```

## Running the Application

### Development Mode
Runs the server with auto-reload on file changes using nodemon:
```bash
npm run dev
```

### Production Mode
Runs the server in production mode:
```bash
npm start
```

### Testing
Run the test suite:
```bash
npm test
```

The server will start on the port specified in your `.env` file (default: 3000).

**Access Points:**
- API Base URL: `http://localhost:3000/api`
- API Documentation: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`

## Project Structure

```
chatbot-backend-api/
├── src/
│   ├── config/                    # Configuration files
│   │   ├── database.js           # MongoDB connection setup
│   │   ├── jwt.js                # JWT token configuration
│   │   ├── oauth.js              # OAuth providers config
│   │   └── openrouter.js         # OpenRouter API config
│   ├── models/                    # Mongoose data models
│   │   ├── User.js               # User schema
│   │   ├── Category.js           # Category schema
│   │   ├── Character.js          # Character schema
│   │   ├── ChatSession.js        # Chat session schema
│   │   ├── Favorite.js           # Favorites schema
│   │   ├── RefreshToken.js       # Refresh token schema
│   │   └── UserPreferences.js    # User preferences schema
│   ├── controllers/               # Request handlers
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User management
│   │   ├── categoryController.js # Category operations
│   │   ├── characterController.js# Character operations
│   │   ├── chatController.js     # Chat functionality
│   │   ├── favoriteController.js # Favorites management
│   │   ├── preferencesController.js # User preferences
│   │   └── analyticsController.js# Analytics endpoints
│   ├── services/                  # Business logic layer
│   │   ├── authService.js        # Auth business logic
│   │   ├── userService.js        # User operations
│   │   ├── categoryService.js    # Category logic
│   │   ├── characterService.js   # Character logic
│   │   ├── chatService.js        # Chat logic
│   │   ├── openrouterService.js  # OpenRouter integration
│   │   ├── oauthService.js       # OAuth integration
│   │   ├── favoriteService.js    # Favorites logic
│   │   ├── preferencesService.js # Preferences logic
│   │   └── recommendationService.js # Recommendation algorithm
│   ├── routes/                    # API route definitions
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── userRoutes.js         # User endpoints
│   │   ├── categoryRoutes.js     # Category endpoints
│   │   ├── characterRoutes.js    # Character endpoints
│   │   ├── chatRoutes.js         # Chat endpoints
│   │   ├── favoriteRoutes.js     # Favorites endpoints
│   │   ├── preferencesRoutes.js  # Preferences endpoints
│   │   └── analyticsRoutes.js    # Analytics endpoints
│   ├── middleware/                # Custom middleware
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── validator.js          # Input validation
│   │   ├── rateLimiter.js        # Rate limiting
│   │   ├── uploadMiddleware.js   # File upload handling
│   │   └── ownershipMiddleware.js# Resource ownership check
│   ├── utils/                     # Utility functions
│   │   ├── encryption.js         # Password encryption
│   │   ├── logger.js             # Winston logger setup
│   │   ├── responseFormatter.js  # API response formatter
│   │   └── tokenBlacklist.js     # JWT blacklist
│   └── index.js                   # Application initialization
├── swagger/                       # API documentation
│   ├── swagger.js                # Swagger configuration
│   └── schemas/                  # API schema definitions
├── uploads/                       # Uploaded files (avatars)
├── app.js                         # Express app setup
├── server.js                      # Server entry point
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/apple` - Apple Sign-In (receives appleId, email, displayName from iOS app)
- `POST /api/auth/google` - Google Sign-In (receives googleId, email, displayName, photoURL from iOS app)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens

### User Management
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `DELETE /api/users/profile` - Delete user account (protected)

### Categories
- `POST /api/categories` - Create category (protected)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category (protected)
- `DELETE /api/categories/:id` - Delete category (protected)

### Characters
- `POST /api/characters` - Create character (protected)
- `GET /api/characters` - Get all characters (with filters)
- `GET /api/characters/:id` - Get character by ID
- `GET /api/characters/my/created` - Get user's characters (protected)
- `PUT /api/characters/:id` - Update character (protected, owner only)
- `DELETE /api/characters/:id` - Delete character (protected, owner only)

### Chat
- `POST /api/chat/sessions` - Start chat session (protected)
- `POST /api/chat/message` - Send message to character (protected)
- `GET /api/chat/sessions` - Get user's chat sessions (protected)
- `GET /api/chat/sessions/count` - Get session count (protected)
- `DELETE /api/chat/sessions/:id` - Delete chat session (protected)

### Favorites
- `POST /api/favorites` - Add character to favorites (protected)
- `DELETE /api/favorites/:characterId` - Remove from favorites (protected)
- `GET /api/favorites` - Get favorite characters (protected)
- `GET /api/favorites/recommendations` - Get recommendations (protected)

### User Preferences
- `GET /api/preferences` - Get user preferences (protected)
- `PUT /api/preferences` - Update preferences (protected)

### Analytics
- `GET /api/analytics/characters` - Character statistics (admin only)
- `GET /api/analytics/categories` - Category popularity (admin only)
- `GET /api/analytics/users` - User engagement (admin only)

### System
- `GET /health` - Health check endpoint
- `GET /api-docs` - Swagger API documentation

## API Documentation

Interactive API documentation is available via Swagger UI once the server is running:

```
http://localhost:3000/api-docs
```

The Swagger documentation provides:
- Complete endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Try-it-out functionality

## Development Guidelines

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments for functions
- Keep functions small and focused
- Use async/await for asynchronous operations

### Error Handling
- All errors should be caught and handled appropriately
- Use the global error handler middleware
- Return standardized error responses
- Log all errors with Winston

### Security Best Practices
- Never commit `.env` file or secrets
- Validate and sanitize all user inputs
- Use parameterized queries to prevent injection
- Implement proper authentication on protected routes
- Keep dependencies up to date

### Database
- Use Mongoose for MongoDB operations
- Define proper indexes for performance
- Use transactions for multi-document operations
- Implement proper error handling for DB operations

### Testing
- Write unit tests for services and utilities
- Write integration tests for API endpoints
- Aim for high test coverage
- Use meaningful test descriptions

## Deployment

### Production Checklist

1. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Use strong, unique secrets for JWT
   - Configure production MongoDB URI
   - Set up proper CORS origins

2. **Security**
   - Enable HTTPS
   - Configure rate limiting appropriately
   - Set up proper firewall rules
   - Use environment variables for all secrets

3. **Database**
   - Use MongoDB Atlas or managed MongoDB
   - Set up database backups
   - Configure proper indexes
   - Enable authentication

4. **Monitoring**
   - Set up application monitoring
   - Configure log aggregation
   - Set up alerts for errors
   - Monitor API performance

5. **Scaling**
   - Use load balancer for multiple instances
   - Configure session management
   - Use Redis for token blacklist in production
   - Implement caching where appropriate

### Deployment Platforms

The application can be deployed to:
- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS** - EC2, ECS, or Elastic Beanstalk
- **Google Cloud** - App Engine or Cloud Run
- **DigitalOcean** - App Platform or Droplets
- **Azure** - App Service

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t chatbot-api .
docker run -p 3000:3000 --env-file .env chatbot-api
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Structure
- Unit tests: Test individual functions and modules
- Integration tests: Test API endpoints end-to-end
- Test files are located in `tests/` directory

## Security

### Authentication
- JWT tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Tokens are blacklisted on logout
- Passwords are encrypted before storage

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Chat endpoints: 30 requests per minute

### Input Validation
- All inputs are validated using Joi schemas
- File uploads are validated for type and size
- NoSQL injection prevention through sanitization

### CORS
- Configured for iOS app origin
- Credentials enabled for authenticated requests
- Preflight requests handled properly

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

**JWT Token Errors**
- Verify JWT_SECRET is set correctly
- Check token expiration settings
- Ensure token is sent in Authorization header

**OpenRouter API Errors**
- Verify API key is valid
- Check API rate limits
- Ensure proper request format

**File Upload Issues**
- Check file size limits
- Verify upload directory permissions
- Ensure proper file type validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

ISC

## Support

For issues and questions:
- Check the API documentation at `/api-docs`
- Review the health check at `/health`
- Check application logs for errors

---

**Built with ❤️ using Node.js, Express, MongoDB, and OpenRouter AI**
