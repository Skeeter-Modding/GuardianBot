# 🗄️ PebbleHost MySQL Database Setup Guide

## 🎯 **Why Use MySQL for Guardian Bot?**

Your bot currently stores data in memory (Maps), which means:
- ❌ **Data Loss**: All ticket history, stats, and logs are lost when bot restarts
- ❌ **No Persistence**: Can't track long-term patterns or statistics
- ❌ **Limited Scalability**: Memory usage grows over time

**MySQL Database Benefits:**
- ✅ **Persistent Storage**: Data survives bot restarts
- ✅ **Advanced Analytics**: Query historical data and trends
- ✅ **Scalability**: Handle thousands of tickets and logs
- ✅ **Backup & Recovery**: PebbleHost handles backups
- ✅ **Multi-Bot Support**: Share data between multiple instances

## 🔧 **Step 1: Create MySQL Database on PebbleHost**

### 📝 **Database Creation:**
1. **Login** to your PebbleHost control panel
2. **Navigate** to: Databases → MySQL Databases
3. **Create Database**:
   - **Database Name**: `guardian_bot_db` (or your preference)
   - **Username**: `guardian_user` (or your preference) 
   - **Password**: Generate a strong password
4. **Note Down**:
   - Database hostname (usually internal IP)
   - Database port (usually 3306)
   - Username and password

### 🌐 **Connection Details Format:**
```
Host: internal-db-host.pebblehost.com (or IP)
Port: 3306
Database: guardian_bot_db
Username: guardian_user
Password: your_generated_password
```

## ⚙️ **Step 2: Configure Guardian Bot**

### 📝 **Update config.json:**
```json
{
  "database": {
    "enabled": true,
    "host": "YOUR_PEBBLEHOST_MYSQL_HOST",
    "port": 3306,
    "user": "YOUR_MYSQL_USERNAME", 
    "password": "YOUR_MYSQL_PASSWORD",
    "database": "YOUR_DATABASE_NAME",
    "connectionLimit": 10,
    "ssl": false
  }
}
```

### 🔧 **Replace the placeholders:**
- `YOUR_PEBBLEHOST_MYSQL_HOST` → Database hostname from PebbleHost
- `YOUR_MYSQL_USERNAME` → Database username you created
- `YOUR_MYSQL_PASSWORD` → Database password you created  
- `YOUR_DATABASE_NAME` → Database name you created

## 📊 **Step 3: Database Tables Created**

The DatabaseManager automatically creates these tables:

### 🎫 **tickets** - Complete ticket tracking
```sql
- ticket_id (unique identifier)
- channel_id, creator info
- subject, description, priority
- status (open/claimed/closed/deleted)
- claimed_by, claim/close timestamps
- Full audit trail
```

### 📈 **staff_stats** - Performance analytics
```sql
- user_id, username
- tickets_claimed/closed/deleted counts
- response time tracking
- calculated average response time
- activity timestamps
```

### 🛡️ **moderation_logs** - Security events
```sql
- guild_id, action_type
- moderator and target info
- reason, details (JSON)
- timestamp tracking
```

### 🔒 **skeeter_protection** - Anti-harassment
```sql
- violation tracking
- warning counts
- message content logging
- action history
```

### 🚨 **raid_tracking** - Anti-raid data
```sql
- join pattern analysis
- suspicious user detection
- account age tracking
- action outcomes
```

## 🚀 **Step 4: Installation & Dependencies**

### 📦 **Install MySQL Driver:**
```bash
npm install mysql2
```

### 🔧 **Bot Integration:**
The DatabaseManager is already created in `src/DatabaseManager.js` and includes:
- ✅ Connection pooling for performance
- ✅ Automatic table creation
- ✅ Error handling and reconnection
- ✅ Complete CRUD operations for all data

## 📊 **Step 5: What Data Gets Stored**

### 🎫 **Ticket System:**
- Every ticket creation, claim, close, delete
- Full conversation history potential
- Response time analytics
- Staff performance metrics

### 🛡️ **Security Events:**
- Raid detection patterns
- Skeeter protection violations
- Admin action monitoring
- Ban/kick/timeout logs

### 📈 **Analytics Ready:**
- Staff leaderboards
- Response time trends  
- Ticket volume patterns
- Security incident tracking

## 🧪 **Step 6: Testing Database Connection**

### 🔍 **Connection Test:**
```javascript
// Test connection (will be integrated into bot startup)
const db = new DatabaseManager();
await db.connect(); // Should show "✅ Connected to MySQL database successfully!"
```

### 📝 **Verification Queries:**
```sql
-- Check tables were created
SHOW TABLES;

-- Check ticket data
SELECT * FROM tickets LIMIT 5;

-- Check staff performance  
SELECT * FROM staff_stats ORDER BY tickets_closed DESC;
```

## 🔐 **Step 7: Security Best Practices**

### 🛡️ **Database Security:**
- ✅ Use dedicated database user (not root)
- ✅ Strong password generation
- ✅ Limited connection pooling
- ✅ Input sanitization (prepared statements)
- ✅ Regular backups (PebbleHost automated)

### 🔒 **Config Protection:**
```bash
# Never commit database credentials
# Consider environment variables for production
export DB_HOST="your_host"
export DB_USER="your_user"  
export DB_PASS="your_password"
```

## 📈 **Step 8: Advanced Features Unlocked**

### 🎯 **With MySQL, you get:**

1. **📊 Dashboard Analytics**:
   - Real-time ticket statistics
   - Staff performance charts
   - Historical trend analysis

2. **🔍 Advanced Queries**:
   - "Show all tickets from last 30 days"
   - "Top 5 staff members by response time"
   - "Most common ticket subjects"

3. **📱 API Endpoints**:
   - `/api/tickets/stats`
   - `/api/staff/leaderboard`  
   - `/api/security/incidents`

4. **📋 Reporting**:
   - Weekly performance reports
   - Monthly security summaries
   - Automated insights

## 🆘 **Troubleshooting**

### 🔌 **Connection Issues:**
- ✅ Verify database credentials
- ✅ Check PebbleHost database status
- ✅ Confirm internal network access
- ✅ Test port 3306 connectivity

### 📝 **Common Errors:**
```
❌ "Access denied" → Check username/password
❌ "Unknown database" → Verify database name
❌ "Connection timeout" → Check host/port
❌ "Too many connections" → Adjust connectionLimit
```

## 📁 **File Structure After Setup**

```
discord-guardian-bot/
├── src/
│   ├── DatabaseManager.js    # MySQL integration
│   ├── BackupManager.js      # Existing files  
│   └── SecurityUtils.js      # Existing files
├── bot.js                    # Main bot (will integrate DB)
├── config.json              # Updated with DB config
└── package.json             # Updated with mysql2
```

## 🎯 **Next Steps**

1. **🔧 Create MySQL database** on PebbleHost control panel
2. **📝 Update config.json** with your database credentials  
3. **📦 Install dependencies**: `npm install mysql2`
4. **🚀 Deploy updated bot** to PebbleHost server
5. **✅ Verify connection** and table creation
6. **📊 Start enjoying** persistent data and analytics!

**Your Guardian Bot will transform from temporary to permanent data powerhouse!** 🔥🗄️

**Ready to set up your MySQL database?** 🚀