# 🗄️ MySQL Database Connection Guide

## 📊 **Step-by-Step Database Setup**

### **Step 1: Create MySQL Database on PebbleHost**

1. **Login** to your PebbleHost control panel
2. **Navigate** to: `Databases` → `MySQL Databases`
3. **Create Database**:
   - **Database Name**: `guardian_bot_db`
   - **Username**: `guardian_user`
   - **Password**: Generate a strong password (save this!)
4. **Note the connection details**:
   - **Host**: (provided by PebbleHost, usually like `mysql.pebblehost.com`)
   - **Port**: `3306` (default)
   - **Database**: `guardian_bot_db`
   - **Username**: `guardian_user`
   - **Password**: (your generated password)

### **Step 2: Update config.json with Real Credentials**

Replace the placeholders in your config.json with actual values:

```json
{
  "database": {
    "enabled": true,
    "host": "mysql.pebblehost.com",
    "port": 3306,
    "user": "guardian_user",
    "password": "YOUR_ACTUAL_PASSWORD_HERE",
    "database": "guardian_bot_db",
    "connectionLimit": 10,
    "ssl": false
  }
}
```

**Example with real values:**
```json
{
  "database": {
    "enabled": true,
    "host": "mysql-1.pebblehost.com",
    "port": 3306,
    "user": "guardian_user_123",
    "password": "mySecurePassword123!",
    "database": "guardian_bot_db_456",
    "connectionLimit": 10,
    "ssl": false
  }
}
```

### **Step 3: Deploy Updated Files**

1. **Upload** the updated `config.json` to PebbleHost
2. **Upload** the updated `bot.js` to PebbleHost
3. **Restart** your bot

### **Step 4: Verify Database Connection**

When you restart your bot, you should see:

**✅ Success:**
```
🛡️ Guardian Bot is online! Logged in as GuardianBot#4781
📊 Database connected - persistent storage enabled!
✅ Database tables initialized successfully!
```

**❌ If database fails:**
```
🛡️ Guardian Bot is online! Logged in as GuardianBot#4781
📊 Database disabled - using memory storage only
```

## 🎯 **What the Database Will Store**

### 🎫 **Tickets Table:**
- Complete ticket lifecycle (create/claim/close/delete)
- User information (creator, claimer, closer)
- Timestamps and response times
- Subject, description, priority

### 📊 **Staff Statistics:**
- Tickets claimed/closed/deleted per staff member
- Average response times
- Performance rankings
- Activity tracking

### 🛡️ **Security Logs:**
- Skeeter protection violations
- Admin monitoring events
- Anti-raid detection data
- Moderation actions

### 🔍 **Analytics Data:**
- Server usage patterns
- Ticket volume trends
- Staff performance metrics
- Security incident tracking

## 🧪 **Testing Database Connection**

### **Test 1: Create a Ticket**
1. Use `/ticket-panel` to create a ticket panel
2. Create a test ticket
3. Check if it gets saved to database

### **Test 2: Check Staff Stats**
1. Have staff claim/close tickets
2. Use `/db-stats` command to view statistics
3. Verify data is persistent after bot restart

## 🔧 **Troubleshooting**

### **Common Connection Issues:**

#### ❌ **"Access denied for user"**
- **Problem**: Wrong username or password
- **Fix**: Double-check credentials in PebbleHost panel

#### ❌ **"Unknown database"** 
- **Problem**: Database name doesn't exist
- **Fix**: Verify database was created successfully

#### ❌ **"Can't connect to MySQL server"**
- **Problem**: Wrong host or port
- **Fix**: Check host address from PebbleHost

#### ❌ **"Too many connections"**
- **Problem**: Connection limit exceeded
- **Fix**: Reduce `connectionLimit` in config

### **Debug Steps:**

1. **Check PebbleHost Database Panel**:
   - Verify database exists
   - Check user has permissions
   - Test connection with phpMyAdmin (if available)

2. **Verify config.json**:
   - No typos in credentials
   - Valid JSON format
   - Correct host/port/database names

3. **Check Bot Logs**:
   - Look for database connection messages
   - Check for specific error messages
   - Verify MySQL2 module is installed

## 📈 **Benefits After Connection**

### ✅ **Persistent Data:**
- Bot restarts don't lose ticket history
- Staff statistics accumulate over time
- Complete audit trails maintained

### ✅ **Advanced Analytics:**
- Historical performance data
- Trend analysis capabilities
- Detailed reporting options

### ✅ **Scalability:**
- Handle unlimited tickets
- Support multiple bot instances
- API-ready data structure

## 🎊 **Database Commands Available**

Once connected, you can use:

```bash
/db-stats                # View database statistics
/ticket-panel           # Create tickets (auto-saved)
# Staff buttons save data automatically
# All security events logged to database
```

## 🔐 **Security Best Practices**

1. **Strong Password**: Use complex database password
2. **Limited Access**: Don't share database credentials
3. **Regular Backups**: PebbleHost handles automatic backups
4. **Monitor Usage**: Check for unusual database activity

**Your Guardian Bot will be transformed into a data powerhouse!** 🗄️🔥

**Ready to set up your MySQL database?** 🚀