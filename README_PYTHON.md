# 🛡️ GUARDIAN BOT - PYTHON EDITION

## 🚀 **COMPLETE DISCORD SECURITY & TICKET SYSTEM**

A powerful Discord bot with advanced security features, comprehensive ticket system, Trump AI integration, and beautiful web dashboard!

---

## ✨ **FEATURES**

### 🎫 **Ticket System**
- **Slash Commands**: `/ticket`, `/claim-ticket`, `/close-ticket`
- **Interactive Panels**: Click-to-create ticket panels
- **Modal Forms**: Rich input forms for detailed ticket creation
- **Priority System**: High/Medium/Low with different colors and behaviors
- **Staff Management**: Claim, assign, and track ticket performance
- **Auto-cleanup**: Channels deleted after closure
- **Performance Tracking**: Response times, efficiency ratings, leaderboards

### 🤖 **Trump AI Integration**
- **Entertaining Responses**: Aggressive/profanity style as requested
- **Ticket Interactions**: Trump responses for claims and closures
- **Multiple Categories**: Different responses for different situations
- **Randomized**: Variety in responses to keep things interesting

### 🌐 **Web Dashboard**
- **Beautiful Interface**: Modern design with gradients and animations
- **Real-time Stats**: Live updates every 30 seconds
- **Server Management**: Lockdown controls and emergency restore
- **Ticket Analytics**: Performance leaderboards and active ticket monitoring
- **Responsive Design**: Works on desktop and mobile

### 🛡️ **Security Features**
- **Anti-Raid**: Automatic detection and protection
- **Admin Monitoring**: Track admin actions and prevent abuse
- **Lockdown System**: Server-wide emergency lockdown
- **Permission Management**: Automatic role-based access control

---

## 🚀 **QUICK START**

### **Method 1: Easy Startup (Windows)**
1. **Double-click** `start_guardian.bat`
2. **Wait** for automatic installation and startup
3. **Access dashboard** at: http://localhost:8000

### **Method 2: Manual Setup**
```bash
# Install Python 3.8+
# Download from: https://www.python.org/downloads/

# Install dependencies
pip install -r requirements.txt

# Start the system
python start_system.py
```

---

## 🔧 **CONFIGURATION**

### **Bot Token Setup**
1. Go to https://discord.com/developers/applications
2. Create new application → Bot → Copy token
3. Update `config.json`:
```json
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "clientId": "YOUR_BOT_CLIENT_ID"
}
```

### **Bot Permissions**
Required Discord permissions:
- ✅ Send Messages
- ✅ Manage Messages  
- ✅ Manage Channels
- ✅ Manage Roles
- ✅ Read Message History
- ✅ Use Slash Commands
- ✅ Attach Files

### **Staff Roles**
Update `config.json` with your staff role IDs:
```json
"ticketSystem": {
  "staffRoleIds": ["ROLE_ID_1", "ROLE_ID_2"],
  "adminRoleIds": ["ADMIN_ROLE_ID"]
}
```

---

## 🎮 **COMMANDS**

### **User Commands**
```
/ticket [subject] [priority]
- Create a new support ticket
- Priority: high/medium/low (optional)

/ticket-panel [channel]
- Create ticket creation panel (Admin only)
```

### **Staff Commands**
```
/claim-ticket [assign-to]
- Claim ticket for yourself or assign to another staff member

/close-ticket [reason]
- Close the current ticket with optional reason

/ticket-stats [user]
- View performance statistics for staff members
```

---

## 🌐 **WEB DASHBOARD**

### **Access Information**
- **URL**: http://localhost:8000
- **Username**: admin
- **Password**: admin123 (from config.json)

### **Dashboard Features**
- 📊 **Main Dashboard**: Bot status, server overview, management controls
- 🎫 **Ticket Statistics**: Active tickets, staff leaderboards, performance metrics
- 🔒 **Security Controls**: Lockdown toggles, emergency restore
- 📈 **Real-time Updates**: Auto-refresh every 30 seconds

### **Page Navigation**
- **Home**: `/` - Main dashboard with server management
- **Tickets**: `/tickets` - Comprehensive ticket analytics
- **API Endpoints**: `/api/*` - REST API for data access

---

## 🎭 **TRUMP AI RESPONSES**

The bot includes entertaining Trump-style responses:

### **Ticket Creation**
*"TREMENDOUS! {user} just created a ticket! We're going to solve this BIGLY!"*

### **Ticket Claims**
*"FANTASTIC! {user} claimed this ticket! They're going to do an AMAZING job!"*

### **Ticket Closures**
*"Another ticket OBLITERATED by {user}! TREMENDOUS work!"*

---

## 📊 **STATISTICS TRACKING**

### **Individual Staff Metrics**
- 🎫 **Total Claimed**: Number of tickets claimed
- ✅ **Total Closed**: Number of tickets successfully resolved
- ⚡ **Response Time**: Average time to first response
- 📊 **Efficiency**: Percentage of claimed tickets closed
- 🏆 **Performance Rating**: Excellent/Good/Needs Improvement

### **Server Overview**
- 📈 **Active Tickets**: Currently open tickets
- 👥 **Staff Activity**: Number of active staff members
- 📊 **Completion Rate**: Overall ticket resolution statistics
- 🏆 **Leaderboards**: Top performing staff members

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

**Bot not responding to /ticket:**
- ✅ Check bot is online (green status in dashboard)
- ✅ Verify bot has slash command permissions
- ✅ Run `/` in Discord to see available commands

**Dashboard won't load:**
- ✅ Check Python is installed
- ✅ Verify all dependencies installed (`pip install -r requirements.txt`)
- ✅ Try accessing http://localhost:8000 directly

**Permission errors:**
- ✅ Update staff role IDs in config.json
- ✅ Ensure bot has Manage Channels permission
- ✅ Check bot role is above staff roles in server hierarchy

### **Support**
- 📧 Check the console output for error messages
- 🔧 Try restarting with `start_guardian.bat`
- 📝 Verify config.json formatting is valid JSON

---

## 🏆 **SYSTEM STATUS**

✅ **Discord Bot**: Full Python implementation with discord.py
✅ **Ticket System**: Complete with modals, buttons, and tracking
✅ **Trump AI**: Loaded with entertaining responses
✅ **Web Dashboard**: FastAPI-based with beautiful templates
✅ **Security Features**: Anti-raid, lockdowns, admin monitoring
✅ **Performance Tracking**: Real-time statistics and leaderboards
✅ **Easy Installation**: One-click Windows batch file setup

---

## 🎉 **READY TO USE!**

The Guardian Bot Python edition is now **COMPLETE** and ready for production! 

🚀 **Start with**: `start_guardian.bat`
🌐 **Dashboard**: http://localhost:8000
🎫 **Commands**: `/ticket`, `/claim-ticket`, `/close-ticket`

*Making Discord Great Again! 🇺🇸*