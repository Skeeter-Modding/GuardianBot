# Discord Guardian Bot

## 🚀 Quick Start

1. **Install Node.js** (version 16 or higher)
2. **Clone/Download** this bot to your computer
3. **Open terminal** in the bot folder
4. **Install dependencies:**
   ```
   npm install
   ```
5. **Configure the bot** (see detailed setup below)
6. **Start the bot:**
   ```
   npm start
   ```

## 🔧 Essential Setup Steps

### 1. Create Your Discord Bot
- Go to https://discord.com/developers/applications
- Create new application → Add Bot
- Copy the bot token (keep secret!)
- Enable all "Privileged Gateway Intents"

### 2. Configure config.json
Replace these values in `config.json`:
```json
{
  "token": "paste_your_bot_token_here",
  "logChannelId": "paste_log_channel_id_here",
  "adminRoleIds": ["paste_admin_role_id_here"],
  "ownerIds": ["paste_your_discord_id_here"]
}
```

### 3. Invite Bot to Server
Use this link (replace CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8589934590&scope=bot
```

### 4. Create Log Channel
- Create a private channel called `#guardian-logs`
- Copy its ID and put in config.json
- Only admins should see this channel

## 🛡️ What This Bot Does

- **Anti-Raid**: Stops mass joins and auto-locks server
- **Anti-Nuke**: Prevents channel/role mass deletion
- **Admin Monitor**: Watches for rogue admins (3 actions in 2 min = warning → punishment)
- **Auto-Lockdown**: Locks server during attacks
- **Complete Logging**: Records all security events
- **Admin Commands**: Full moderation toolkit

## 📋 Commands
- `!help` - Show all commands
- `!lockdown` - Lock the server
- `!unlock` - Unlock the server
- `!ban <user> [reason]` - Ban someone
- `!kick <user> [reason]` - Kick someone
- `!purge <number>` - Delete messages
- `!status` - Check bot status

## ⚠️ Important Notes
- Bot needs Administrator permissions to work properly
- Test in a development server first
- Keep your bot token secret
- Monitor the logs channel regularly

## 🆘 Need Help?
1. Check README.md for detailed instructions
2. Ensure bot has proper permissions
3. Verify all IDs in config.json are correct
4. Make sure bot token is valid