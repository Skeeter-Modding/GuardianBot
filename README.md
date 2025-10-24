# 🛡️ Discord Guardian Bot

An advanced Discord security bot with comprehensive anti-raid, anti-nuke protection, and admin monitoring features designed to protect your Discord server from malicious attacks and rogue administrators.

## ✨ Features

### 🛡️ Anti-Raid Protection
- **Rapid Join Detection**: Monitors for suspicious mass joins
- **Automatic Response**: Kicks recent joiners during detected raids
- **Auto-Lockdown**: Automatically locks down server during raid attempts
- **Configurable Thresholds**: Customize join limits and time windows

### 💥 Anti-Nuke Protection
- **Channel/Role Deletion Monitoring**: Tracks mass deletions
- **Rapid Response**: Immediate lockdown on nuke attempts
- **Automatic Protection**: Prevents server destruction
- **Audit Log Integration**: Identifies and punishes nukers

### 👮 Admin Monitoring System
- **Action Tracking**: Monitors admin kicks, bans, and mutes
- **Time-Based Limits**: 3 actions in 2 minutes triggers warnings
- **Progressive Punishment**: Warning → Role Removal → Ban
- **Rogue Admin Protection**: Automatic response to admin abuse

### 🔒 Server Lockdown
- **Instant Lockdown**: Lock all channels with one command
- **Emergency Response**: Automatic lockdown during attacks
- **Permission Management**: Removes dangerous permissions temporarily
- **Quick Recovery**: Easy unlock when threat passes

### 📝 Comprehensive Logging
- **All Events Logged**: Joins, leaves, bans, kicks, role changes
- **Real-time Alerts**: Instant notifications in log channel
- **Detailed Information**: User IDs, timestamps, reasons
- **Security Audit Trail**: Complete record of all activities

### ⚡ Admin Commands
- `!lockdown` - Lock down the entire server
- `!unlock` - Remove server lockdown
- `!ban <user> [reason]` - Ban a user
- `!kick <user> [reason]` - Kick a user
- `!purge <amount>` - Delete messages (1-100)
- `!status` - Show bot protection status
- `!settings` - Show current configuration
- `!help` - Show all available commands

## 🚀 Setup Instructions

### Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Copy the bot token (keep this secret!)
5. Enable all "Privileged Gateway Intents":
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

### Step 2: Bot Permissions

The bot needs these permissions (Permission Integer: `8589934590`):
- Administrator (recommended for full functionality)
- Or manually grant:
  - View Channels
  - Send Messages
  - Manage Messages
  - Embed Links
  - Read Message History
  - Use Slash Commands
  - Kick Members
  - Ban Members
  - Manage Channels
  - Manage Roles
  - View Audit Log

### Step 3: Install Dependencies

```bash
cd discord-guardian-bot
npm install
```

### Step 4: Configure Bot

1. Open `config.json`
2. Replace the following values:

```json
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "clientId": "YOUR_BOT_CLIENT_ID",
  "logChannelId": "CHANNEL_ID_FOR_LOGS",
  "adminRoleIds": ["ADMIN_ROLE_ID_1", "ADMIN_ROLE_ID_2"],
  "ownerIds": ["YOUR_DISCORD_ID_HERE"]
}
```

**How to get IDs:**
- Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
- Right-click on channels/roles/users and select "Copy ID"

### Step 5: Create Log Channel

1. Create a private channel for logs (e.g., `#guardian-logs`)
2. Copy the channel ID and put it in `config.json`
3. Make sure only admins can see this channel

### Step 6: Invite Bot to Server

Use this invite link (replace CLIENT_ID with your bot's client ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8589934590&scope=bot
```

### Step 7: Start the Bot

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## ⚙️ Configuration Options

### Anti-Raid Settings
```json
"antiRaid": {
  "enabled": true,
  "joinThreshold": 5,        // Max joins before triggering
  "timeWindow": 10000,       // Time window in milliseconds (10 seconds)
  "punishmentType": "kick",  // "kick" or "none"
  "lockdownOnRaid": true     // Auto-lockdown on raid detection
}
```

### Anti-Nuke Settings
```json
"antiNuke": {
  "enabled": true,
  "channelDeleteThreshold": 3,  // Max channel deletions
  "roleDeleteThreshold": 3,     // Max role deletions
  "timeWindow": 30000,          // Time window (30 seconds)
  "banNukers": true            // Auto-ban nukers (requires audit log access)
}
```

### Admin Monitoring Settings
```json
"adminMonitoring": {
  "enabled": true,
  "actionThreshold": 3,      // Max actions before warning
  "timeWindow": 120000,      // Time window (2 minutes)
  "warningEnabled": true,    // Send warning before punishment
  "autoRemoveRoles": true,   // Remove admin roles after warning
  "autoBan": true           // Ban rogue admin after role removal
}
```

## 🔧 Advanced Setup

### Multiple Servers
Each server needs its own log channel ID in the config. For multiple servers, consider using environment variables or a database.

### Custom Roles
Add your admin role IDs to `adminRoleIds` array in config to grant bot command access.

### Whitelist System
The bot includes a whitelist command structure for exempting trusted users from certain protections (feature in development).

## 🛠️ Troubleshooting

### Bot Not Responding
- Check bot token is correct
- Ensure bot has necessary permissions
- Verify bot is online in Discord

### Commands Not Working
- Ensure you have admin permissions or required roles
- Check if bot can read messages in the channel
- Verify bot has permission to send messages

### Logging Not Working
- Check log channel ID in config
- Ensure bot can send messages to log channel
- Verify channel exists and bot has access

### Anti-Raid Not Triggering
- Check if anti-raid is enabled in config
- Verify join threshold and time window settings
- Ensure bot has kick permissions if punishment is enabled

## 🔒 Security Best Practices

1. **Bot Token Security**: Never share your bot token publicly
2. **Log Channel Privacy**: Keep log channel private and admin-only
3. **Role Hierarchy**: Place bot role above admin roles for proper functioning
4. **Regular Updates**: Keep Discord.js and dependencies updated
5. **Monitor Logs**: Regularly check guardian logs for security events

## 📊 Default Protection Thresholds

- **Raid Detection**: 5 joins in 10 seconds
- **Admin Actions**: 3 moderation actions in 2 minutes
- **Nuke Detection**: 3 channel/role deletions in 30 seconds
- **Response Time**: Instant detection and sub-second response

## 🆘 Emergency Commands

If the bot becomes unresponsive or needs immediate action:
- `!lockdown` - Immediately locks down server
- `!status` - Check bot and protection status
- Remove bot permissions temporarily if needed

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues or feature requests, create an issue in the repository or contact the bot administrator.

---

**⚠️ Important:** This bot requires significant permissions to function properly. Only grant these permissions if you trust the bot operator. Always test in a development server first.