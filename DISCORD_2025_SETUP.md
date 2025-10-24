# 🛡️ Guardian Bot - Discord 2025 Setup Guide

## 🌟 Modern Discord Features (2025)

Guardian Bot now supports all the latest Discord features:

- ✅ **User-Installable Apps** - Works in DMs and group chats
- ✅ **Guild-Installable Apps** - Works in Discord servers  
- ✅ **Context-Aware Commands** - Commands work where they should
- ✅ **Modern Permissions** - Proper permission handling
- ✅ **Interactive Components** - Buttons, modals, select menus

## 🚀 Quick Setup (2025 Method)

### Step 1: Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to **Installation** page
4. Under **Installation Contexts**, enable both:
   - ✅ **User Install** 
   - ✅ **Guild Install**

### Step 2: Configure Scopes & Permissions

**For User Install:**
- Add scope: `applications.commands`

**For Guild Install:**  
- Add scopes: `bot` + `applications.commands`
- Bot Permissions: Select permissions you need (at minimum `Send Messages`)

### Step 3: Bot Configuration

1. Go to **Bot** page
2. Copy **Bot Token** → put in `config.json` as `"token"`
3. Go to **General Information** page  
4. Copy **Application ID** → put in `config.json` as `"clientId"`
5. Enable **Privileged Gateway Intents** if needed:
   - Server Members Intent (for user info)
   - Message Content Intent (for message scanning)

### Step 4: Start Guardian Bot

Run the modern startup script:
```batch
start_modern.bat
```

This will:
1. ✅ Install latest dependencies
2. ✅ Register modern slash commands  
3. ✅ Generate installation links
4. ✅ Start the bot

## 🔗 Installation Links

After running `start_modern.bat`, you'll get two installation links:

### 🏰 **Guild Install** (For Discord Servers)
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### 👤 **User Install** (For DMs/Personal Use)
```  
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=applications.commands
```

## 🎫 Ticket System Commands

### For Servers (Guild Install):
- `/ticket` - Create support ticket (shows modal form)
- `/claim-ticket` - Staff claim ticket  
- `/close-ticket` - Close ticket
- `/ticket-panel` - Create ticket panel with buttons (Admin)
- `/ticket-stats` - View statistics
- `/ticket-transcript` - Generate transcript

### For DMs (User Install):
- `/ticket` - Create personal support ticket
- `/ticket-stats` - View your ticket history
- `/status` - Check bot status

## 🇺🇸 Trump AI Commands

Works in both servers and DMs:
- `/trump` - Get Trump-style response
- `/trump topic:discord` - Trump responds about specific topic

## 🛡️ Security Commands

- `/skeeter-check` - Check protection status
- `/setup` - Configure bot for server (Admin only)

## 🌐 Dashboard Access

### Local Dashboard:
1. Bot starts dashboard automatically on port 3000
2. Visit: `http://localhost:3000`

### Public Dashboard:
1. Run: `deploy_public.bat`  
2. Follow hosting instructions
3. Get public URL like `guardianbot.herokuapp.com`

## 🔧 Troubleshooting

### Command Registration Issues:
- ❌ **Error 50001**: Missing `applications.commands` scope
- ❌ **Error 50013**: Missing permissions  
- ❌ **Error 50027**: Invalid bot token

### Bot Won't Start:
1. Check `config.json` has correct token and clientId
2. Verify bot token in Discord Developer Portal
3. Ensure Node.js is installed: `node --version`
4. Check privileged intents are enabled if needed

### `/ticket` Not Showing Modal:
1. Make sure commands are registered: `node register_commands.js`
2. Verify bot has `applications.commands` scope
3. Check bot permissions in server
4. Try removing and re-adding bot

## 📋 config.json Template

```json
{
    "token": "YOUR_BOT_TOKEN_HERE",
    "clientId": "YOUR_APPLICATION_ID_HERE",
    "guildId": "YOUR_TEST_SERVER_ID", 
    "dashboardToken": "guardian123",
    "supportServer": "https://discord.gg/your-support",
    "ticketSystem": {
        "categoryId": "",
        "staffRoleIds": ["ROLE_ID_1", "ROLE_ID_2"],
        "maxTicketsPerUser": 3,
        "priorities": {
            "high": {
                "emoji": "🔴",
                "color": 15158332,
                "pingRoles": ["STAFF_ROLE_ID"]
            },
            "medium": {
                "emoji": "🟡", 
                "color": 16776960,
                "pingRoles": []
            },
            "low": {
                "emoji": "🟢",
                "color": 5763719,
                "pingRoles": []
            }
        }
    }
}
```

## 🎯 What's New in 2025

- **User-Installable Apps**: Bot works in DMs now!
- **Modern Slash Commands**: Context-aware and permission-based
- **Better Security**: Proper verification and token handling  
- **Enhanced Components**: Better buttons, modals, and interactions
- **Installation Contexts**: Smart command availability
- **Improved Performance**: Optimized for Discord's latest API

## 🚀 Ready to Go!

Your Guardian Bot is now configured with all the latest Discord 2025 features. Users can install it both in their servers and for personal use in DMs!

**Start with:** `start_modern.bat`  
**Test ticket system:** `/ticket` in Discord  
**View dashboard:** `http://localhost:3000`