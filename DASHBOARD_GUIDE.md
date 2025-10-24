# Guardian Bot Dashboard Setup Guide

## 🎯 Complete Dashboard System Created!

Your Guardian Bot now has a **comprehensive web dashboard** with Discord OAuth2 authentication, admin logs, and staff ticket management.

## 📁 New Files Created

```
dashboard/
├── server.js              # Main dashboard server with OAuth2
├── views/
│   ├── layout.ejs         # Main layout template
│   ├── index.ejs          # Home page
│   ├── admin.ejs          # Owner admin dashboard
│   ├── tickets.ejs        # Staff ticket management
│   └── error.ejs          # Error pages
└── public/                # Static files (existing)

guardian.js                # Combined bot + dashboard launcher
```

## ⚙️ Configuration Required

### 1. Discord Application Setup

1. Go to https://discord.com/developers/applications
2. Select your bot application
3. Go to **OAuth2 > General**
4. Add redirect URI: `http://localhost:3000/auth/discord/callback`
5. For production: `https://guardianbot.my.pebble.host/auth/discord/callback`
6. Copy your **Client Secret**

### 2. Environment Variables

Set your Discord Client Secret:
```bash
# For local development
set DISCORD_CLIENT_SECRET=your_client_secret_here

# For production (PebbleHost)
export DISCORD_CLIENT_SECRET=your_client_secret_here
```

Or update `config.json`:
```json
{
  "dashboard": {
    "clientSecret": "your_client_secret_here"
  }
}
```

## 🚀 Running the Dashboard

### Option 1: Full System (Bot + Dashboard)
```bash
npm run guardian
# or
npm run full
```

### Option 2: Dashboard Only
```bash
npm run dashboard
```

### Option 3: Bot Only (existing)
```bash
npm start
```

## 🔐 Dashboard Features

### **👑 Owner Admin Dashboard** (`/admin`)
- **Access:** Bot owners only (your Discord ID: `701257205445558293`)
- **Features:**
  - Real-time moderation logs
  - System statistics (servers, users, uptime)
  - Skeeter protection violations
  - Ticket statistics and analytics
  - Staff performance leaderboard
  - Live WebSocket updates

### **🎫 Staff Ticket Dashboard** (`/tickets`)
- **Access:** Staff members with admin roles + bot owners
- **Features:**
  - View all open/claimed tickets
  - Claim tickets remotely
  - Close tickets with tracking
  - Personal performance stats
  - Recent activity history
  - Real-time ticket updates

### **🔒 Authentication System**
- Discord OAuth2 integration
- Automatic role-based redirects
- Session management (24-hour sessions)
- Secure access control

## 🌐 Access URLs

### Local Development
- **Home:** http://localhost:3000/
- **Login:** http://localhost:3000/auth/discord
- **Admin:** http://localhost:3000/admin (owners only)
- **Tickets:** http://localhost:3000/tickets (staff only)

### Production (PebbleHost)
- **Home:** https://guardianbot.my.pebble.host/
- **Admin:** https://guardianbot.my.pebble.host/admin
- **Tickets:** https://guardianbot.my.pebble.host/tickets

## 📊 Dashboard Capabilities

### **Real-Time Features**
- ✅ Live moderation log streaming
- ✅ Instant ticket updates
- ✅ WebSocket connections for all users
- ✅ Auto-refresh every 30 seconds
- ✅ Real-time notifications

### **Admin Features (Owner Only)**
- ✅ Complete moderation history
- ✅ System health monitoring
- ✅ Staff performance analytics
- ✅ Skeeter protection tracking
- ✅ Database statistics

### **Staff Features**
- ✅ Remote ticket management
- ✅ Claim/close tickets from web
- ✅ Personal performance tracking
- ✅ Ticket priority handling
- ✅ Activity history

### **Database Integration**
- ✅ Connected to your MySQL database
- ✅ Real moderation logs
- ✅ Persistent ticket data
- ✅ Staff statistics tracking
- ✅ Performance analytics

## 🛠️ Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Discord Client Secret
Either set environment variable or update config.json

### 3. Update OAuth2 Redirect URLs
Add dashboard URLs to your Discord application

### 4. Start the System
```bash
npm run guardian
```

## 🎯 What You Get

### **For You (Owner):**
- **Complete administrative control** over all bot activities
- **Real-time monitoring** of all moderation actions
- **Staff performance insights** and analytics
- **System health** and uptime monitoring
- **Skeeter protection** violation tracking

### **For Your Staff:**
- **Remote ticket management** from anywhere
- **Professional ticket interface** with priority handling
- **Performance tracking** and statistics
- **Real-time updates** and notifications
- **Mobile-responsive** interface

## 🔧 Advanced Configuration

### Database Connection
The dashboard automatically connects to your existing MySQL database and displays:
- All moderation logs
- Ticket data and statistics
- Staff performance metrics
- Skeeter protection violations

### Security Features
- Discord OAuth2 authentication
- Role-based access control
- Session security
- CSRF protection
- Secure API endpoints

## 🚀 Production Deployment

For PebbleHost deployment:

1. Upload all dashboard files
2. Set environment variables
3. Update Discord OAuth2 redirect URLs
4. Install dependencies: `npm install`
5. Start with: `npm run guardian`

## 🎉 Success!

Your Guardian Bot now has a **professional web dashboard** with:
- ✅ Discord OAuth2 authentication
- ✅ Owner admin panel with complete logs
- ✅ Staff ticket management system
- ✅ Real-time updates via WebSocket
- ✅ Mobile-responsive design
- ✅ MySQL database integration
- ✅ Role-based security

**Access your dashboard at:** http://localhost:3000/

**Ready to manage your Discord server like a pro!** 🛡️