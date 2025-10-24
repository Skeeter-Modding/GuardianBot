# 🗄️ PebbleHost MySQL Setup - Final Steps

## ✅ **Your MySQL Server Details:**
- **Host**: `na05-sql.pebblehost.com`
- **Port**: `3306`
- **Status**: ✅ Updated in config.json

## 🔧 **Remaining Steps:**

### **Step 1: Create Database in PebbleHost Panel**

1. **Login** to PebbleHost control panel
2. **Navigate** to: `Databases` → `MySQL Databases`
3. **Create New Database**:
   - **Database Name**: `guardian_bot_db` (or your choice)
   - **Username**: `guardian_user` (or your choice)
   - **Password**: Generate strong password (save it!)

### **Step 2: Complete config.json**

Update these remaining placeholders with your actual values:

```json
{
  "database": {
    "enabled": true,
    "host": "na05-sql.pebblehost.com",
    "port": 3306,
    "user": "YOUR_ACTUAL_USERNAME_HERE",
    "password": "YOUR_ACTUAL_PASSWORD_HERE", 
    "database": "YOUR_ACTUAL_DATABASE_NAME_HERE",
    "connectionLimit": 10,
    "ssl": false
  }
}
```

**Example with sample values:**
```json
{
  "database": {
    "enabled": true,
    "host": "na05-sql.pebblehost.com",
    "port": 3306,
    "user": "guardian_user_123",
    "password": "mySecurePass456!",
    "database": "guardian_bot_db_789",
    "connectionLimit": 10,
    "ssl": false
  }
}
```

### **Step 3: Deploy and Test**

1. **Upload** updated `config.json` and `bot.js` to PebbleHost
2. **Restart** your bot
3. **Check logs** for successful connection:

**✅ Success Message:**
```
🛡️ Guardian Bot is online! Logged in as GuardianBot#4781
📊 Database connected - persistent storage enabled!
✅ Database tables initialized successfully!
```

**❌ If connection fails:**
```
🛡️ Guardian Bot is online! Logged in as GuardianBot#4781
📊 Database disabled - using memory storage only
```

## 🧪 **Test Database Connection**

### **Quick Test:**
1. Use `/ticket-panel` in Discord to create a ticket panel
2. Create a test ticket
3. Have staff claim and close it
4. Restart bot - ticket data should persist!

### **Advanced Test:**
1. Use `/db-stats` command to view database statistics
2. Check staff performance metrics
3. Verify all data survives bot restarts

## 🎯 **Connection String Summary:**

Your bot will connect to:
```
mysql://username:password@na05-sql.pebblehost.com:3306/database_name
```

## 🔐 **Security Notes:**

- ✅ Keep database credentials secure
- ✅ Use strong passwords
- ✅ Don't share config.json publicly
- ✅ PebbleHost handles SSL/security

## 📊 **What Gets Stored:**

Once connected, your database will automatically store:

### 🎫 **Tickets:**
- Every ticket creation, claim, close, delete
- Complete audit trail with timestamps
- Staff performance metrics

### 🛡️ **Security Events:**
- Skeeter protection violations
- Anti-raid detection data
- Admin monitoring logs
- Moderation actions

### 📈 **Analytics:**
- Staff leaderboards
- Response time tracking
- Historical trends
- Performance insights

**Your Guardian Bot is ready for enterprise-level data storage!** 🗄️🔥

**Next**: Create the database in PebbleHost panel and update the remaining config values! 🚀