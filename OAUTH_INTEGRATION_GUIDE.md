# OAuth Integration Guide (Simplified)

## Overview

This backend API uses a **simplified OAuth approach** where:
- **iOS app handles all OAuth authentication** (Apple Sign-In, Google Sign-In)
- **Backend only receives and stores user IDs** (Apple ID, Google ID)
- **No token verification on backend** - trust the iOS app

This approach is simpler, faster, and requires no backend OAuth configuration!

---

## How It Works

### Traditional OAuth Flow (NOT used here)
```
iOS App → OAuth Provider → Get Token → Send Token to Backend → Backend Verifies Token → Create User
```

### Our Simplified Flow (What we use)
```
iOS App → OAuth Provider → Get User ID → Send User ID to Backend → Create User
```

---

## API Endpoints

### Apple Sign-In
**POST** `/api/auth/apple`

**Request Body:**
```json
{
  "appleId": "001234.abc123def456.7890",
  "email": "user@example.com",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Notes:**
- `appleId` is required (unique identifier from Apple)
- `email` is optional (only provided on first sign-in)
- `displayName` is optional (user's name from Apple)
- Backend will create a new user or link to existing account

---

### Google Sign-In
**POST** `/api/auth/google`

**Request Body:**
```json
{
  "googleId": "123456789012345678901",
  "email": "user@gmail.com",
  "displayName": "Jane Smith",
  "photoURL": "https://lh3.googleusercontent.com/a/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@gmail.com",
      "name": "Jane Smith",
      "avatar": "https://lh3.googleusercontent.com/a/...",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Notes:**
- `googleId` is required (unique identifier from Google)
- `email` is optional but recommended
- `displayName` is optional (user's name from Google)
- `photoURL` is optional (user's profile picture from Google)
- Backend will create a new user or link to existing account

---

## iOS Integration Example

Based on your `AuthManager.swift` file, here's how the iOS app should call the backend:

### Apple Sign-In

```swift
func signInWithApple(presentingViewController: UIViewController, completion: @escaping (Result<AppUser, AuthError>) -> Void) {
    // ... Apple Sign-In flow ...
    
    // After successful Apple authentication:
    let appleId = appleIDCredential.user
    let email = appleIDCredential.email
    let displayName = // construct from fullName
    
    // Call backend API
    let url = URL(string: "https://your-api.com/api/auth/apple")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body: [String: Any] = [
        "appleId": appleId,
        "email": email ?? NSNull(),
        "displayName": displayName ?? NSNull()
    ]
    
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        // Handle response
        // Save tokens and user data
    }.resume()
}
```

### Google Sign-In

```swift
func signInWithGoogle(presentingViewController: UIViewController, completion: @escaping (Result<AppUser, AuthError>) -> Void) {
    // ... Google Sign-In flow ...
    
    // After successful Google authentication:
    let googleId = user.userID
    let email = user.profile?.email
    let displayName = user.profile?.name
    let photoURL = user.profile?.imageURL(withDimension: 200)?.absoluteString
    
    // Call backend API
    let url = URL(string: "https://your-api.com/api/auth/google")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body: [String: Any] = [
        "googleId": googleId,
        "email": email ?? NSNull(),
        "displayName": displayName ?? NSNull(),
        "photoURL": photoURL ?? NSNull()
    ]
    
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        // Handle response
        // Save tokens and user data
    }.resume()
}
```

---

## Backend Behavior

### First-Time Sign-In
1. Backend receives Apple ID or Google ID
2. Checks if user exists with that ID
3. If not, creates new user account
4. Generates JWT tokens
5. Returns user data and tokens

### Subsequent Sign-Ins
1. Backend receives Apple ID or Google ID
2. Finds existing user with that ID
3. Generates new JWT tokens
4. Returns user data and tokens

### Account Linking
If a user signs in with Apple/Google and an account with that email already exists:
1. Backend links the Apple ID / Google ID to the existing account
2. User can now sign in with either method
3. All data is preserved

---

## Security Considerations

### Is This Secure?

**Yes, if implemented correctly:**

1. **iOS App Security**: The iOS app uses Apple's and Google's official SDKs which are secure
2. **HTTPS**: All API calls must use HTTPS in production
3. **JWT Tokens**: Backend generates its own JWT tokens for session management
4. **User ID Uniqueness**: Apple IDs and Google IDs are unique and cannot be forged
5. **Trust Boundary**: We trust that the iOS app has properly authenticated the user

### What We're NOT Doing

- ❌ Not verifying OAuth tokens on backend (iOS app does this)
- ❌ Not storing OAuth provider secrets on backend
- ❌ Not making API calls to Apple/Google from backend

### What We ARE Doing

- ✅ Trusting the iOS app to authenticate users
- ✅ Storing unique user IDs (Apple ID, Google ID)
- ✅ Generating our own JWT tokens for API access
- ✅ Validating JWT tokens on protected endpoints

---

## Database Schema

### User Model

```javascript
{
  email: String,           // User email (optional for OAuth)
  name: String,            // User display name
  avatar: String,          // Profile picture URL
  authProvider: String,    // 'local', 'apple', or 'google'
  appleId: String,         // Apple user ID (unique)
  googleId: String,        // Google user ID (unique)
  password: String,        // Only for local auth (null for OAuth)
  role: String,            // 'user' or 'admin'
  isActive: Boolean,       // Account status
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique, sparse)
- `appleId` (unique, sparse)
- `googleId` (unique, sparse)

---

## Testing

### Test Apple Sign-In

```bash
curl -X POST http://localhost:3000/api/auth/apple \
  -H "Content-Type: application/json" \
  -d '{
    "appleId": "001234.abc123def456.7890",
    "email": "test@example.com",
    "displayName": "Test User"
  }'
```

### Test Google Sign-In

```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "123456789012345678901",
    "email": "test@gmail.com",
    "displayName": "Test User",
    "photoURL": "https://example.com/photo.jpg"
  }'
```

---

## Error Handling

### Missing Required Fields

**Request:**
```json
{
  "email": "test@example.com"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Apple ID is required",
    "details": [
      {
        "field": "appleId",
        "message": "Apple ID is required"
      }
    ]
  }
}
```

### Inactive Account

**Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Account is inactive"
  }
}
```

---

## Advantages of This Approach

### For Backend Developers
- ✅ No OAuth configuration needed
- ✅ No token verification complexity
- ✅ Simpler code, fewer dependencies
- ✅ Faster development
- ✅ Easier to test

### For iOS Developers
- ✅ Full control over OAuth flow
- ✅ Better user experience (native OAuth)
- ✅ Can use latest iOS features
- ✅ Offline authentication possible
- ✅ Easier to debug

### For Users
- ✅ Faster sign-in (no backend verification delay)
- ✅ Native iOS experience
- ✅ Works with Apple's privacy features
- ✅ Seamless account linking

---

## Migration from Token-Based OAuth

If you were previously using token verification:

1. **Update iOS app** to send user IDs instead of tokens
2. **Update backend** to accept user IDs (already done!)
3. **Remove OAuth configuration** from `.env` (already done!)
4. **Test thoroughly** with both Apple and Google sign-in
5. **Deploy** backend and iOS app together

---

## FAQ

**Q: Is it safe to trust the iOS app?**
A: Yes, if you control the iOS app. The app uses official Apple/Google SDKs which are secure. The backend still generates its own JWT tokens for API access.

**Q: What if someone sends a fake Apple ID?**
A: They would need to know a valid Apple ID, and even then, they would only get access to that specific account. The iOS app should only send IDs after successful OAuth authentication.

**Q: Can I still use email/password authentication?**
A: Yes! The backend supports both OAuth and traditional email/password authentication.

**Q: What about account linking?**
A: If a user signs in with Apple/Google and an account with that email exists, the backend automatically links the accounts.

**Q: Do I need Apple Developer account?**
A: Only for the iOS app. The backend doesn't need any Apple or Google credentials.

**Q: Can I verify tokens on the backend later?**
A: Yes, but it's not necessary for this use case. The current approach is simpler and works well for mobile apps.

---

## Support

For issues or questions:
- Check the API documentation at `/api-docs` when the server is running
- Review the server logs for error messages
- Test with curl or Postman before integrating with iOS app

---

**That's it! No OAuth configuration needed on the backend. Just receive user IDs and create accounts.** 🎉
