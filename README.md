# GuardianBot - Advanced Discord Moderation Bot

A comprehensive Discord moderation bot with anti-nuke protection, leveling system, auto-moderation, and a secure web dashboard.

## 🌟 Features

### 🛡️ Security & Protection
- **Anti-Nuke System**: Automatically detects and bans users who delete multiple channels/roles
- **Anti-Raid Protection**: Detects mass joins and auto-kicks raiders
- **Admin Action Monitoring**: Tracks suspicious admin behavior
- **Protected Users**: Safeguard specific users from moderation actions

### ⚖️ Moderation Tools
- **Warnings System**: Track user infractions with database storage
- **Timeout/Mute**: Temporary and permanent mute capabilities
- **Ban/Kick**: Standard moderation actions with reason logging
- **Purge Messages**: Bulk delete messages with filters
- **Lockdown**: Server-wide emergency lockdown mode
- **Slowmode**: Channel-specific rate limiting

### 🤖 Auto-Moderation
- **Spam Detection**: Configurable message spam protection
- **Link Filtering**: Block unwanted links and URLs
- **Caps Lock Detection**: Prevent excessive caps messages
- **Duplicate Message Detection**: Stop copy-paste spam
- **Mention Spam Protection**: Limit mass mentions
- **Configurable Actions**: Warning, mute, kick, or ban options

### 📊 Leveling System
- **XP & Levels**: Reward active members with XP
- **Leaderboard**: Track top members by XP
- **Custom XP Management**: Manual XP adjustments for admins
- **Database Persistence**: All progress saved to MySQL

### 📝 Role Logging
- **Complete Role Tracking**: Logs all role additions, removals, and modifications
- **Member Role Changes**: Track when users gain/lose roles
- **Role Management**: Monitor role creation, updates, and deletion
- **Audit Integration**: Identifies which moderator performed actions
- **Dashboard View**: View role logs in the web dashboard

### 🌐 Web Dashboard
- **Discord OAuth2 Authentication**: Secure login with Discord
- **Permission-Based Access**: Users only see servers they have admin rights in
- **Bot Owner Access**: Full access to all servers for bot owner
- **Server Management**: View stats, warnings, moderation logs
- **Auto-Mod Configuration**: Adjust auto-mod settings per server
- **Staff Analytics**: Monitor moderator activity
- **Role Logs**: View complete role change history

## 📋 Requirements

- Node.js 16.9.0 or higher
- MySQL database
- Discord Bot Token
- Discord Application with proper intents enabled

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/guardianbot.git
cd guardianbot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Bot

#### Edit `config.json`:
```json
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "clientId": "YOUR_CLIENT_ID_HERE",
  "logChannelId": "YOUR_LOG_CHANNEL_ID",
  "adminRoleIds": ["ADMIN_ROLE_ID_1", "ADMIN_ROLE_ID_2"],
  "ownerIds": ["YOUR_DISCORD_USER_ID"]
}
```

#### Create `.env` file:
```env
DASHBOARD_PORT=3000
DOMAIN=http://localhost:3000
DISCORD_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
SESSION_SECRET=random-secure-string-here
```

### 4. Set Up Database

Run the SQL setup files:
```bash
# Main database setup
mysql -u your-user -p your-database < database-setup.sql

# Role logging setup
mysql -u your-user -p your-database < role-logging-update.sql
```

### 5. Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select your existing one
3. Enable these **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
4. In **OAuth2 > General**:
   - Copy your **Client Secret** and add it to `.env`
   - Add redirect URI: `http://localhost:3000/auth/callback`
5. In **Bot** section:
   - Copy your **Bot Token** and add it to `config.json`

### 6. Deploy Slash Commands
```bash
node deploy-commands.js
```

### 7. Start the Bot
```bash
node bot.js
```

The dashboard will be available at `http://localhost:3000`

## 🎮 Slash Commands

### Moderation
- `/ban` - Ban a user from the server
- `/unban` - Unban a user
- `/kick` - Kick a user from the server
- `/mute` - Timeout a user
- `/unmute` - Remove timeout from a user
- `/warn` - Issue a warning to a user
- `/warnings` - View a user's warnings
- `/clearwarnings` - Clear a user's warnings
- `/purge` - Bulk delete messages

### Server Management
- `/lockdown` - Lock down the server
- `/unlock` - Unlock the server
- `/slowmode` - Set channel slowmode

### Owner Commands
- `/setadmin` - Add an admin role
- `/protectuser` - Protect a user from moderation
- `/unprotectuser` - Remove user protection
- `/reloadconfig` - Reload configuration

### Information
- `/serverinfo` - Display server information
- `/userinfo` - Display user information
- `/botinfo` - Display bot information
- `/ping` - Check bot latency
- `/help` - Show help message

### Leveling
- `/rank` - Check your rank and XP
- `/leaderboard` - View server leaderboard
- `/setxp` - Set a user's XP (admin only)

### Custom Commands
- `/addcommand` - Create a custom command
- `/removecommand` - Delete a custom command
- `/listcommands` - List all custom commands

### Auto-Moderation
- `/automod` - Configure auto-moderation settings

## 🔒 Security Features

### Anti-Nuke Protection
The bot monitors:
- Channel deletions (3 or more in 30 seconds = auto-ban)
- Role deletions (3 or more in 30 seconds = auto-ban)
- Uses Discord Audit Logs to identify the culprit

### Dashboard Security
- **Discord OAuth2 Required**: All users must authenticate via Discord
- **Permission Validation**: Users can only access servers where they have admin rights
- **Bot Owner Privileges**: Full access to all servers for configured owner
- **Token Expiration**: Sessions expire after 24 hours

## ⚠️ Important Notes

- **Keep your tokens secure!** Never commit `.env` or `config.json` with real credentials
- **Backup your database regularly**
- **Test in a development server first** before deploying to production

## 📄 License

MIT License

---

Made with ❤️ for Discord server protection
