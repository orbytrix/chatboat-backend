# Cookie Authentication Guide

## Overview

The API now supports **two authentication methods**:

1. **Authorization Header** (for mobile apps, Postman)
2. **Cookies** (for web browsers)

Both methods work simultaneously - use whichever is more convenient!

---

## How It Works

### When You Login/Register

The API automatically:
1. Returns tokens in the response body (as before)
2. **Sets HTTP-only cookies** with the tokens

```json
Response Body:
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}

Cookies Set:
- accessToken (1 hour, httpOnly, secure in production)
- refreshToken (7 days, httpOnly, secure in production)
```

### When You Make Requests

The API checks for tokens in **this order**:
1. **Authorization header** (`Bearer <token>`)
2. **Cookie** (`accessToken` cookie)

If either is found, authentication succeeds!

---

## Cookie Security Features

### HttpOnly
- Cookies cannot be accessed by JavaScript
- Protects against XSS attacks
- Only the browser can send them

### Secure (Production)
- Cookies only sent over HTTPS in production
- Prevents man-in-the-middle attacks

### SameSite
- `strict` in production (CSRF protection)
- `lax` in development (easier testing)

### Automatic Expiration
- Access token: 1 hour
- Refresh token: 7 days
- Browser automatically removes expired cookies

---

## Usage Examples

### For Web Browsers

**1. Login (sets cookies automatically):**
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include', // Important! Includes cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Logged in!', data);
  // Cookies are automatically set by browser
});
```

**2. Make authenticated requests:**
```javascript
fetch('http://localhost:3000/api/users/profile', {
  method: 'GET',
  credentials: 'include' // Sends cookies automatically
})
.then(res => res.json())
.then(data => {
  console.log('Profile:', data);
});
```

**3. Logout (clears cookies automatically):**
```javascript
fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
})
.then(res => res.json())
.then(data => {
  console.log('Logged out!', data);
  // Cookies are automatically cleared
});
```

### For Mobile Apps (iOS/Android)

**Continue using Authorization header as before:**
```swift
// iOS Example
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
```

No changes needed for mobile apps!

### For Postman

**Option 1: Use Authorization Header (recommended)**
- Set `Authorization: Bearer {{accessToken}}`
- Works as before

**Option 2: Use Cookies**
- After login, cookies are automatically saved
- Enable "Automatically follow redirects" in Postman settings
- Cookies will be sent with subsequent requests

---

## API Endpoints

### All authentication endpoints now set cookies:

**Register**
```
POST /api/auth/register
Body: { email, password, name }
Response: User data + tokens
Cookies: accessToken, refreshToken ✅
```

**Login**
```
POST /api/auth/login
Body: { email, password }
Response: User data + tokens
Cookies: accessToken, refreshToken ✅
```

**Apple Sign-In**
```
POST /api/auth/apple
Body: { appleId, email, displayName }
Response: User data + tokens
Cookies: accessToken, refreshToken ✅
```

**Google Sign-In**
```
POST /api/auth/google
Body: { googleId, email, displayName, photoURL }
Response: User data + tokens
Cookies: accessToken, refreshToken ✅
```

**Refresh Token**
```
POST /api/auth/refresh
Body: { refreshToken } OR Cookie: refreshToken
Response: New access token
Cookies: Updated accessToken ✅
```

**Logout**
```
POST /api/auth/logout
Body: { refreshToken } OR Cookie: refreshToken
Response: Success message
Cookies: Cleared ✅
```

---

## Protected Endpoints

All protected endpoints now accept tokens from:
- Authorization header: `Bearer <token>`
- Cookie: `accessToken`

**Examples:**
```
GET /api/users/profile
PUT /api/users/profile
DELETE /api/users/profile
POST /api/characters
GET /api/chat/sessions
... and all other protected endpoints
```

---

## Refresh Token Flow

### With Cookies (Automatic)

```javascript
// 1. Login (cookies set automatically)
await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ email, password })
});

// 2. Make requests (cookies sent automatically)
await fetch('/api/users/profile', {
  credentials: 'include'
});

// 3. When access token expires, refresh it
await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include'
  // No body needed! Refresh token from cookie
});

// 4. Continue making requests with new token
await fetch('/api/users/profile', {
  credentials: 'include'
});
```

### With Authorization Header (Manual)

```javascript
// 1. Login and save tokens
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { accessToken, refreshToken } = loginRes.data;

// 2. Make requests with access token
await fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 3. When access token expires, refresh it
const refreshRes = await fetch('/api/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refreshToken })
});
const { accessToken: newAccessToken } = refreshRes.data;

// 4. Use new access token
await fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${newAccessToken}`
  }
});
```

---

## CORS Configuration

For cookie authentication to work from a web browser, CORS must be configured:

**Backend (already configured):**
```javascript
// app.js
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true // Allow cookies
}));
```

**Frontend:**
```javascript
// Always include credentials
fetch(url, {
  credentials: 'include' // Important!
});
```

---

## Testing with cURL

**Login with cookies:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}' \
  -c cookies.txt
```

**Make authenticated request:**
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -b cookies.txt
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

## Environment Variables

No new environment variables needed! Cookie settings automatically adjust based on `NODE_ENV`:

**Development:**
- `secure: false` (works with HTTP)
- `sameSite: 'lax'` (easier testing)

**Production:**
- `secure: true` (HTTPS only)
- `sameSite: 'strict'` (better security)

---

## Troubleshooting

### Cookies not being set

**Check:**
1. Are you using `credentials: 'include'` in fetch?
2. Is CORS configured with `credentials: true`?
3. Are you on the same domain (or CORS allows your domain)?

### Cookies not being sent

**Check:**
1. Are you using `credentials: 'include'` in fetch?
2. Are cookies expired? (Check browser DevTools → Application → Cookies)
3. Is the cookie domain correct?

### "No token provided" error

**Check:**
1. Is the cookie named `accessToken`?
2. Is the cookie httpOnly? (Should be)
3. Try using Authorization header instead

---

## Best Practices

### For Web Apps
✅ Use cookies (automatic, more secure)
✅ Set `credentials: 'include'` on all requests
✅ Let browser handle cookie storage
✅ Use HTTPS in production

### For Mobile Apps
✅ Use Authorization header (more control)
✅ Store tokens securely (Keychain/KeyStore)
✅ Implement token refresh logic
✅ Clear tokens on logout

### For APIs/Services
✅ Use Authorization header (easier integration)
✅ Store tokens in environment variables
✅ Rotate tokens regularly

---

## Migration Guide

### If you're already using Authorization headers:

**No changes needed!** The API still accepts Authorization headers exactly as before. Cookies are an additional option, not a replacement.

### If you want to switch to cookies:

**Frontend changes:**
```javascript
// Before
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// After
fetch(url, {
  credentials: 'include' // That's it!
});
```

---

## Summary

✅ **Two authentication methods** - Header or Cookie
✅ **Automatic cookie management** - Set on login, cleared on logout
✅ **Secure by default** - HttpOnly, Secure (prod), SameSite
✅ **No breaking changes** - Authorization header still works
✅ **Better for web apps** - Browser handles everything
✅ **Mobile apps unchanged** - Continue using headers

**Choose the method that works best for your use case!** 🎉
