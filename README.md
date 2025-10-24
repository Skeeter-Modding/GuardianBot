# 🛡️ Guardian Bot# 🛡️ Discord Guardian Bot



Advanced Discord security bot with comprehensive anti-raid, anti-nuke protection, warning system, and admin monitoring.An advanced Discord security bot with comprehensive anti-raid, anti-nuke protection, and admin monitoring features designed to protect your Discord server from malicious attacks and rogue administrators.



## ⚡ Quick Start## ✨ Features



1. **Install Dependencies**### 🛡️ Anti-Raid Protection

   ```bash- **Rapid Join Detection**: Monitors for suspicious mass joins

   npm install- **Automatic Response**: Kicks recent joiners during detected raids

   ```- **Auto-Lockdown**: Automatically locks down server during raid attempts

- **Configurable Thresholds**: Customize join limits and time windows

2. **Configure Bot**

   - Copy `config.template.json` to `config.json`### 💥 Anti-Nuke Protection

   - Add your Discord bot token and database credentials- **Channel/Role Deletion Monitoring**: Tracks mass deletions

   - Configure your server settings- **Rapid Response**: Immediate lockdown on nuke attempts

- **Automatic Protection**: Prevents server destruction

3. **Register Commands**- **Audit Log Integration**: Identifies and punishes nukers

   ```bash

   npm run register### 👮 Admin Monitoring System

   ```- **Action Tracking**: Monitors admin kicks, bans, and mutes

- **Time-Based Limits**: 3 actions in 2 minutes triggers warnings

4. **Start Bot**- **Progressive Punishment**: Warning → Role Removal → Ban

   ```bash- **Rogue Admin Protection**: Automatic response to admin abuse

   npm start

   ```### 🔒 Server Lockdown

- **Instant Lockdown**: Lock all channels with one command

## 🎯 Core Features- **Emergency Response**: Automatic lockdown during attacks

- **Permission Management**: Removes dangerous permissions temporarily

### 🛡️ Security Protection- **Quick Recovery**: Easy unlock when threat passes

- **Anti-Raid System**: Detects and stops mass joins

- **Anti-Nuke Protection**: Prevents channel/role mass deletion  ### 📝 Comprehensive Logging

- **Admin Monitoring**: Tracks rogue administrator actions- **All Events Logged**: Joins, leaves, bans, kicks, role changes

- **Auto-Lockdown**: Automatically locks server during attacks- **Real-time Alerts**: Instant notifications in log channel

- **Skeeter Protection**: Special protection for designated users- **Detailed Information**: User IDs, timestamps, reasons

- **Security Audit Trail**: Complete record of all activities

### ⚠️ Warning System

- **Issue Warnings**: `/warn <user> <reason>` - Track user behavior### ⚡ Admin Commands

- **View History**: `/warnings [user]` - See warning records- `!lockdown` - Lock down the entire server

- **Remove Warnings**: `/removewarn <id>` - Manage warnings- `!unlock` - Remove server lockdown

- **Escalation Alerts**: Automatic notices at 3+ warnings- `!ban <user> [reason]` - Ban a user

- **Database Storage**: Persistent warning records with audit trails- `!kick <user> [reason]` - Kick a user

- `!purge <amount>` - Delete messages (1-100)

### 🔧 Moderation Tools- `!status` - Show bot protection status

- **Lockdown/Unlock**: `/lockdown` `/unlock` - Server-wide protection- `!settings` - Show current configuration

- **User Management**: `/ban` `/kick` `/purge` - Standard moderation- `!help` - Show all available commands

- **Emergency Restore**: `/emergency-restore` - Fix broken permissions

- **Status Monitoring**: `/status` - Real-time security status## 🚀 Setup Instructions



### 🎫 Ticket System### Step 1: Create Discord Bot

- **Create Tickets**: `/ticket` - Support ticket creation

- **Staff Management**: `/claim-ticket` `/close-ticket` - Ticket handling1. Go to [Discord Developer Portal](https://discord.com/developers/applications)

- **Statistics**: Track ticket performance and response times2. Click "New Application" and give it a name

3. Go to "Bot" section and click "Add Bot"

## 📋 Commands4. Copy the bot token (keep this secret!)

5. Enable all "Privileged Gateway Intents":

### Security Commands   - Presence Intent

- `/lockdown [reason]` - Lock down entire server   - Server Members Intent

- `/unlock [reason]` - Remove server lockdown     - Message Content Intent

- `/emergency-restore` - Fix broken lockdown permissions

- `/status` - Show bot protection status### Step 2: Bot Permissions



### Moderation CommandsThe bot needs these permissions (Permission Integer: `8589934590`):

- `/ban <user> [reason]` - Ban a user- Administrator (recommended for full functionality)

- `/kick <user> [reason]` - Kick a user- Or manually grant:

- `/purge <amount>` - Delete messages (1-100)  - View Channels

- `/warn <user> <reason>` - Issue warning to user  - Send Messages

- `/warnings [user] [show-removed]` - View user warnings  - Manage Messages

- `/removewarn <id> [reason]` - Remove warning by ID  - Embed Links

  - Read Message History

### Ticket Commands  - Use Slash Commands

- `/ticket` - Create support ticket  - Kick Members

- `/claim-ticket` - Claim ticket (staff)  - Ban Members

- `/close-ticket` - Close ticket  - Manage Channels

- `/ticket-panel` - Create ticket panel (admin)  - Manage Roles

  - View Audit Log

### Information Commands

- `/help` - Show all commands### Step 3: Install Dependencies

- `/settings` - Show current settings

```bash

## ⚙️ Configurationcd discord-guardian-bot

npm install

Edit `config.json` with your settings:```



```json### Step 4: Configure Bot

{

  "token": "YOUR_BOT_TOKEN",1. Open `config.json`

  "clientId": "YOUR_BOT_CLIENT_ID", 2. Replace the following values:

  "logChannelId": "LOG_CHANNEL_ID",

  "adminRoleIds": ["ADMIN_ROLE_ID"],```json

  "ownerIds": ["OWNER_USER_ID"],{

  "protectedUsers": ["PROTECTED_USER_ID"],  "token": "YOUR_BOT_TOKEN_HERE",

  "antiRaid": {  "clientId": "YOUR_BOT_CLIENT_ID",

    "enabled": true,  "logChannelId": "CHANNEL_ID_FOR_LOGS",

    "joinThreshold": 5,  "adminRoleIds": ["ADMIN_ROLE_ID_1", "ADMIN_ROLE_ID_2"],

    "timeWindow": 30000  "ownerIds": ["YOUR_DISCORD_ID_HERE"]

  },}

  "antiNuke": {```

    "enabled": true,

    "channelDeleteThreshold": 3,**How to get IDs:**

    "timeWindow": 10000- Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)

  },- Right-click on channels/roles/users and select "Copy ID"

  "adminMonitoring": {

    "enabled": true,### Step 5: Create Log Channel

    "actionThreshold": 3,

    "timeWindow": 1200001. Create a private channel for logs (e.g., `#guardian-logs`)

  },2. Copy the channel ID and put it in `config.json`

  "database": {3. Make sure only admins can see this channel

    "enabled": true,

    "host": "localhost",### Step 6: Invite Bot to Server

    "user": "guardian",

    "password": "password",Use this invite link (replace CLIENT_ID with your bot's client ID):

    "database": "guardian_bot"```

  }https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8589934590&scope=bot

}```

```

### Step 7: Start the Bot

## 🔑 Required Permissions

```bash

The bot needs these Discord permissions:npm start

- Administrator (recommended) OR:```

- Manage Channels

- Manage Roles  For development with auto-restart:

- Kick Members```bash

- Ban Membersnpm run dev

- Manage Messages```

- View Audit Log

- Send Messages## ⚙️ Configuration Options

- Embed Links

- Use Slash Commands### Anti-Raid Settings

```json

## 📊 Database"antiRaid": {

  "enabled": true,

The bot uses MySQL for persistent data storage:  "joinThreshold": 5,        // Max joins before triggering

- **Warnings**: User warning history and management  "timeWindow": 10000,       // Time window in milliseconds (10 seconds)

- **Tickets**: Support ticket tracking and statistics    "punishmentType": "kick",  // "kick" or "none"

- **Moderation Logs**: Complete audit trail of all actions  "lockdownOnRaid": true     // Auto-lockdown on raid detection

- **Raid Tracking**: Anti-raid event monitoring}

```

## 🚀 Deployment

### Anti-Nuke Settings

1. **Development**```json

   ```bash"antiNuke": {

   npm start  "enabled": true,

   ```  "channelDeleteThreshold": 3,  // Max channel deletions

  "roleDeleteThreshold": 3,     // Max role deletions

2. **Production**   "timeWindow": 30000,          // Time window (30 seconds)

   - Use a process manager like PM2  "banNukers": true            // Auto-ban nukers (requires audit log access)

   - Set up MySQL database}

   - Configure proper permissions```

   - Monitor logs for issues

### Admin Monitoring Settings

## 🛠️ Troubleshooting```json

"adminMonitoring": {

### Bot Not Responding  "enabled": true,

- Check bot token is correct  "actionThreshold": 3,      // Max actions before warning

- Verify bot has necessary permissions  "timeWindow": 120000,      // Time window (2 minutes)

- Ensure bot is online in Discord  "warningEnabled": true,    // Send warning before punishment

  "autoRemoveRoles": true,   // Remove admin roles after warning

### Commands Not Working    "autoBan": true           // Ban rogue admin after role removal

- Check if you have required permissions}

- Verify bot can read/send messages in channel```

- Try `/help` to see available commands

## 🔧 Advanced Setup

### Database Issues

- Ensure MySQL is running### Multiple Servers

- Check database credentials in configEach server needs its own log channel ID in the config. For multiple servers, consider using environment variables or a database.

- Verify database permissions

### Custom Roles

### Permission ErrorsAdd your admin role IDs to `adminRoleIds` array in config to grant bot command access.

- Check bot role hierarchy

- Ensure bot has required channel permissions### Whitelist System

- Use `/emergency-restore` for lockdown issuesThe bot includes a whitelist command structure for exempting trusted users from certain protections (feature in development).



## 📜 License## 🛠️ Troubleshooting



MIT License - see LICENSE file for details.### Bot Not Responding

- Check bot token is correct

## 👨‍💻 Author- Ensure bot has necessary permissions

- Verify bot is online in Discord

Created by SKEETS_GUARDIAN

### Commands Not Working

---- Ensure you have admin permissions or required roles

- Check if bot can read messages in the channel

🛡️ **Guardian Bot** - Protecting Discord servers with advanced security features and comprehensive moderation tools.- Verify bot has permission to send messages

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