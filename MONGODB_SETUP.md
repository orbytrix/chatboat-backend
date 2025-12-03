# MongoDB Setup Guide

## Quick Start

You have two options for MongoDB:

### Option 1: Local MongoDB (Recommended for Development)

**Install MongoDB:**
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. MongoDB will start automatically as a service

**Start MongoDB (if not running):**
```bash
# Windows (if installed as service)
net start MongoDB

# Or run manually
mongod
```

**Check if MongoDB is running:**
```bash
# Open MongoDB shell
mongosh

# Or check the service
# Windows: Services app → Look for "MongoDB"
```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

**Setup:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

**Update `.env` file:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot-db?retryWrites=true&w=majority
```

Replace:
- `username` - Your MongoDB Atlas username
- `password` - Your MongoDB Atlas password
- `cluster` - Your cluster name

---

## Current Error

```
MongoDB connection error: Server selection timed out after 5000 ms
```

**This means:** MongoDB is not running or not accessible.

---

## Solution

### For Local MongoDB:

**1. Check if MongoDB is installed:**
```bash
mongod --version
```

**2. Start MongoDB:**
```bash
# Windows
net start MongoDB

# Or run manually in a separate terminal
mongod
```

**3. Verify it's running:**
```bash
mongosh
# Should connect successfully
```

**4. Update `.env` file:**
```env
MONGODB_URI=mongodb://localhost:27017/chatbot-db
```

**5. Restart your server:**
```bash
npm start
```

### For MongoDB Atlas (Cloud):

**1. Create free cluster at:** https://www.mongodb.com/cloud/atlas

**2. Get connection string:**
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string

**3. Update `.env` file:**
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/chatbot-db?retryWrites=true&w=majority
```

**4. Whitelist your IP:**
- In Atlas, go to "Network Access"
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (for development)

**5. Restart your server:**
```bash
npm start
```

---

## Verify Connection

Once MongoDB is running and your server starts, you should see:

```
✅ Database connection established successfully
✅ Cloudinary: Enabled (Cloud: your-cloud-name)
✅ Server running in development mode on port 3000
```

---

## Troubleshooting

### Error: "MongoDB connection error"

**Check:**
1. Is MongoDB running?
   ```bash
   # Windows
   tasklist | findstr mongod
   
   # Should show mongod.exe process
   ```

2. Is the connection string correct in `.env`?
   ```env
   MONGODB_URI=mongodb://localhost:27017/chatbot-db
   ```

3. Can you connect with mongosh?
   ```bash
   mongosh
   ```

### Error: "Authentication failed"

**For Atlas:**
- Check username/password in connection string
- Make sure user has read/write permissions
- Check if IP is whitelisted

**For Local:**
- Local MongoDB usually doesn't require authentication by default

### Error: "Network timeout"

**For Atlas:**
- Check your internet connection
- Verify IP is whitelisted in Atlas
- Try "Allow Access from Anywhere" temporarily

**For Local:**
- Make sure MongoDB service is running
- Check if port 27017 is not blocked by firewall

---

## Quick Test

Once MongoDB is running:

```bash
# Test connection with mongosh
mongosh mongodb://localhost:27017/chatbot-db

# Should connect successfully
# Then type:
show dbs
exit
```

---

## Recommended: MongoDB Compass (GUI)

**Download:** https://www.mongodb.com/try/download/compass

**Benefits:**
- Visual interface for MongoDB
- Easy to browse collections
- Can test connections
- View and edit data

**Connect:**
1. Open Compass
2. Enter connection string: `mongodb://localhost:27017`
3. Click "Connect"
4. Browse your `chatbot-db` database

---

## Next Steps

1. **Start MongoDB** (local or Atlas)
2. **Update `.env`** with correct connection string
3. **Restart server:** `npm start`
4. **Import Postman collection** and start testing!

---

**Need Help?**

- MongoDB Docs: https://docs.mongodb.com/
- Atlas Docs: https://docs.atlas.mongodb.com/
- Community: https://www.mongodb.com/community/forums/
