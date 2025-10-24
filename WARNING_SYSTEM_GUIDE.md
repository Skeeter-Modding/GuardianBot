# ⚠️ Guardian Bot Warning System

The Guardian Bot now includes a comprehensive warning system to track user behavior and provide progressive moderation capabilities.

## 🎯 Features

- **Persistent Warnings**: All warnings are stored in the database with full audit trails
- **Escalation Notices**: Automatic alerts when users reach 3+ warnings
- **Moderation Logging**: All warning actions are logged for transparency
- **User Notifications**: Users receive DMs when warned (if DMs are enabled)
- **Warning Management**: Moderators can view, add, and remove warnings
- **Statistics Tracking**: Server-wide warning statistics and analytics

## 📋 Commands

### `/warn <user> <reason>`
Issue a warning to a user with a specific reason.

**Permissions Required**: `MODERATE_MEMBERS`

**Features**:
- Stores warning in database with moderator info
- Sends DM notification to user
- Shows escalation notice if user has 3+ warnings
- Logs action to server log channel
- Prevents warning bots or protected users

**Example**: `/warn @BadUser Spamming in general chat`

### `/warnings [user] [show-removed]`
View warning history for a user (defaults to yourself if no user specified).

**Permissions Required**: `MODERATE_MEMBERS`

**Options**:
- `user`: User to check warnings for (optional)
- `show-removed`: Include removed warnings in the list (optional)

**Features**:
- Shows up to 10 most recent warnings
- Displays warning ID, reason, moderator, and date
- Shows removal info for deleted warnings
- Color-coded by warning count (green = none, orange = some, red = many)

### `/removewarn <warning-id> [reason]`
Remove a warning by its ID number.

**Permissions Required**: `MODERATE_MEMBERS`

**Options**:
- `warning-id`: The ID number of the warning to remove (required)
- `reason`: Reason for removing the warning (optional)

**Features**:
- Marks warning as inactive (doesn't delete from database)
- Records who removed it and when
- Logs removal action to server log channel
- Maintains audit trail

## 🛡️ Security Features

### Protection Checks
- Cannot warn yourself
- Cannot warn bots
- Cannot warn protected users (defined in config)
- Only users with `MODERATE_MEMBERS` permission can use commands

### Escalation System
- Automatic notices when users reach 3+ warnings
- Warning embeds change color based on severity:
  - 🟡 Orange: 1-2 warnings
  - 🔴 Red: 3+ warnings (escalation notice)

### Audit Trail
- All warnings track: user, moderator, reason, timestamp
- Warning removals track: who removed, when, and why
- Full moderation logging integration
- Database persistence ensures no data loss

## 📊 Integration

### Status Command Enhancement
The `/status` command now shows warning system statistics:
- Number of active warnings in the server
- 30-day warning statistics
- Total warned users

### Help Command
All warning commands are included in the `/help` command with descriptions.

### Database Schema
```sql
CREATE TABLE warnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    username VARCHAR(100) NOT NULL,
    moderator_id VARCHAR(20) NOT NULL,
    moderator_username VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    removed_by VARCHAR(20) NULL,
    removed_by_username VARCHAR(100) NULL,
    removed_at TIMESTAMP NULL,
    removal_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

The warning system requires:
1. Database connection enabled in `config.json`
2. MySQL database with proper credentials
3. Bot permissions: `MODERATE_MEMBERS`, `SEND_MESSAGES`, `EMBED_LINKS`

## 💡 Best Practices

### For Moderators
1. **Be Specific**: Use clear, detailed reasons for warnings
2. **Progressive**: Start with warnings before escalating to kicks/bans
3. **Document**: The system automatically tracks everything
4. **Review**: Use `/warnings` to check user history before action

### For Server Admins
1. **Monitor**: Check `/status` regularly for warning statistics
2. **Train Staff**: Ensure moderators understand the warning system
3. **Escalation**: Establish clear policies for 3+ warning situations
4. **Regular Review**: Periodically review and remove outdated warnings

## 🚀 Getting Started

1. Ensure database is configured and connected
2. Grant moderators the `MODERATE_MEMBERS` permission
3. Use `/warn` to issue first warning
4. Check `/help` for all available commands
5. Monitor with `/status` and `/warnings`

The warning system integrates seamlessly with Guardian Bot's existing security features and provides a comprehensive moderation toolkit for server administrators.