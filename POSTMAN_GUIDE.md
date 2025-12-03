# Postman Collection Guide

## Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `Chatbot-API.postman_collection.json`
4. Click **Import**

## Setup

### 1. Configure Base URL

The collection uses a variable `{{baseUrl}}` which is set to `http://localhost:3000` by default.

To change it:
1. Click on the collection name
2. Go to **Variables** tab
3. Update `baseUrl` value (e.g., `https://your-api.com`)

### 2. Authentication

Most endpoints require authentication. The collection automatically saves tokens after login.

**How it works:**
- After successful login/register, the `accessToken` is automatically saved
- All protected endpoints use this token automatically
- If token expires, use the **Refresh Token** endpoint

## Usage Flow

### Step 1: Register or Login

**Option A: Register New User**
1. Go to **Authentication** → **Register**
2. Update the email/password in the body
3. Click **Send**
4. ✅ Token is automatically saved

**Option B: Login Existing User**
1. Go to **Authentication** → **Login**
2. Update the email/password
3. Click **Send**
4. ✅ Token is automatically saved

**Option C: Apple Sign-In**
1. Go to **Authentication** → **Apple Sign-In**
2. Update the `appleId`, `email`, `displayName`
3. Click **Send**
4. ✅ Token is automatically saved

**Option D: Google Sign-In**
1. Go to **Authentication** → **Google Sign-In**
2. Update the `googleId`, `email`, `displayName`, `photoURL`
3. Click **Send**
4. ✅ Token is automatically saved

### Step 2: Create a Category

1. Go to **Categories** → **Create Category**
2. Update the category details
3. Click **Send**
4. ✅ `categoryId` is automatically saved

### Step 3: Create a Character

1. Go to **Characters** → **Create Character**
2. Update the form data:
   - `name`: Character name
   - `prompt`: Character personality
   - `categoryId`: Uses saved category ID
   - `avatar`: Upload an image file
3. Click **Send**
4. ✅ `characterId` is automatically saved

### Step 4: Start Chatting

1. Go to **Chat** → **Start Chat Session**
2. Uses saved `characterId`
3. Click **Send**
4. ✅ `sessionId` is automatically saved

5. Go to **Chat** → **Send Message**
6. Update the message text
7. Click **Send**
8. Get AI response!

## Collection Variables

The collection automatically manages these variables:

| Variable | Description | Auto-saved |
|----------|-------------|------------|
| `baseUrl` | API base URL | Manual |
| `accessToken` | JWT access token | ✅ Yes |
| `refreshToken` | JWT refresh token | ✅ Yes |
| `userId` | Current user ID | ✅ Yes |
| `categoryId` | Last created category | ✅ Yes |
| `characterId` | Last created character | ✅ Yes |
| `sessionId` | Last chat session | ✅ Yes |

## Endpoints Overview

### Authentication (No Auth Required)
- ✅ Register
- ✅ Login
- ✅ Apple Sign-In
- ✅ Google Sign-In
- ✅ Refresh Token
- 🔒 Logout (requires auth)

### Users (Auth Required)
- 🔒 Get Profile
- 🔒 Update Profile (with avatar upload)
- 🔒 Delete Account

### Categories
- 🔒 Create Category (auth required)
- ✅ Get All Categories (public)
- ✅ Get Category by ID (public)
- 🔒 Update Category (auth required)
- 🔒 Delete Category (auth required)

### Characters
- 🔒 Create Character (auth required, with avatar upload)
- ✅ Get All Characters (public, optional auth)
- 🔒 Get My Characters (auth required)
- ✅ Search Characters (public, optional auth)
- ✅ Get Character by ID (public, optional auth)
- 🔒 Update Character (auth required, owner only)
- 🔒 Delete Character (auth required, owner only)

### Chat (Auth Required)
- 🔒 Start Chat Session
- 🔒 Send Message (gets AI response)
- 🔒 Get Chat Sessions
- 🔒 Get Session Count
- 🔒 Delete Chat Session

### Favorites (Auth Required)
- 🔒 Add to Favorites
- 🔒 Get Favorites
- 🔒 Get Recommendations
- 🔒 Remove from Favorites

### Preferences (Auth Required)
- 🔒 Get Preferences
- 🔒 Update Preferences

### Analytics (Admin Only)
- 🔒 Get Character Statistics
- 🔒 Get Category Popularity
- 🔒 Get User Engagement

### System (No Auth)
- ✅ Health Check
- ✅ Root (API info)

## Tips

### 1. File Uploads

For endpoints with file uploads (avatar images):
1. Select **Body** → **form-data**
2. For the `avatar` field, change type to **File**
3. Click **Select Files** and choose an image
4. Supported formats: JPG, PNG, GIF, WebP (max 5MB)

### 2. Query Parameters

Some endpoints support query parameters:
- **Get All Characters**: `?categoryId=xxx&search=wizard&page=1&limit=20`
- **Search Characters**: `?q=wizard&categoryId=xxx`
- **Get Chat Sessions**: `?characterId=xxx`

Enable/disable query params by checking/unchecking them in Postman.

### 3. Token Expiration

If you get a `401 Unauthorized` error:
1. Go to **Authentication** → **Refresh Token**
2. Click **Send**
3. New `accessToken` is automatically saved
4. Retry your request

### 4. Testing OAuth

To test Apple/Google Sign-In:
1. Use the **Apple Sign-In** or **Google Sign-In** endpoints
2. Provide the user ID from the iOS app
3. Backend creates/links the account
4. Token is automatically saved

### 5. Admin Endpoints

To test admin endpoints:
1. You need an admin account
2. Update user role in database: `db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})`
3. Login with admin account
4. Access analytics endpoints

## Environment Setup

### Local Development
```
baseUrl: http://localhost:3000
```

### Production
```
baseUrl: https://your-api.com
```

To switch environments:
1. Click on collection
2. Go to **Variables** tab
3. Update `baseUrl`

## Troubleshooting

### Error: "Token is required"
- Make sure you're logged in
- Check that `accessToken` variable is set
- Try refreshing the token

### Error: "Invalid token"
- Token might be expired
- Use **Refresh Token** endpoint
- Or login again

### Error: "File size too large"
- Avatar images must be under 5MB
- Compress the image before uploading

### Error: "Character not found"
- Make sure you created a character first
- Check that `characterId` variable is set
- Or manually set the character ID

### Error: "Category not found"
- Create a category first
- Check that `categoryId` variable is set

## Quick Test Sequence

1. **Register** → Saves token
2. **Create Category** → Saves categoryId
3. **Create Character** → Saves characterId (upload avatar!)
4. **Start Chat Session** → Saves sessionId
5. **Send Message** → Get AI response!
6. **Add to Favorites** → Save character
7. **Get Recommendations** → Get personalized suggestions

## Notes

- All timestamps are in ISO 8601 format
- All IDs are MongoDB ObjectIds
- Cloudinary is used for image storage
- OpenRouter API is used for AI responses
- Rate limits: 5 req/15min (auth), 30 req/min (chat), 100 req/15min (API)

---

**Happy Testing! 🚀**

For issues, check the server logs or API response error messages.
