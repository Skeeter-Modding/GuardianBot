# GitHub Copilot Instructions for GuardianBot

## Project Overview

GuardianBot is an advanced Discord security bot with comprehensive anti-raid, anti-nuke protection, and admin monitoring features designed to protect Discord servers from malicious attacks and rogue administrators.

## Technology Stack

### Primary Languages and Frameworks
- **Node.js**: Primary runtime environment
- **Discord.js v14**: Main Discord API library for bot functionality
- **Python 3.x**: Secondary language for specific components
- **MySQL**: Database for persistent storage

### Key Dependencies
- **Express.js**: Web server for dashboard
- **Socket.io**: Real-time communication
- **Passport.js**: OAuth2 authentication
- **EJS**: Template engine
- **discord.py**: Python Discord library

## Project Structure

```
GuardianBot/
├── bot.js                 # Main bot entry point (Node.js)
├── guardian.js            # Guardian wrapper
├── discord_bot.py         # Python bot alternative
├── src/                   # Core modules
│   ├── DatabaseManager.js
│   ├── BackupManager.js
│   └── SecurityUtils.js
├── dashboard/             # Web dashboard
├── templates/             # HTML templates
└── config.json           # Bot configuration (contains sensitive data)
```

## Development Guidelines

### Code Style and Standards

1. **JavaScript**
   - Use ES6+ features (const, let, arrow functions, async/await)
   - Use camelCase for variables and functions
   - Use PascalCase for classes
   - Include JSDoc comments for complex functions
   - Prefer async/await over promise chains

2. **Python**
   - Follow PEP 8 style guide
   - Use snake_case for variables and functions
   - Use type hints where appropriate
   - Include docstrings for functions and classes

3. **Error Handling**
   - Always wrap Discord API calls in try-catch blocks
   - Log errors with meaningful context
   - Provide user-friendly error messages in Discord embeds

### Security Considerations

⚠️ **CRITICAL**: This project contains sensitive data in `config.json`
- Never commit actual tokens, passwords, or API keys
- Use `config.template.json` as a reference for structure
- Ensure `.gitignore` excludes sensitive files
- Always validate user input before processing
- Use PermissionFlagsBits for permission checks

### Discord Bot Development

1. **Intents**: The bot requires specific privileged gateway intents:
   - Server Members Intent
   - Message Content Intent
   - Presence Intent (optional)
   
2. **Permissions**: Bot needs administrator or specific permissions:
   - View Channels, Send Messages, Embed Links
   - Kick Members, Ban Members
   - Manage Channels, Manage Roles
   - View Audit Log

3. **Command Patterns**:
   - Use slash commands (Discord.js SlashCommandBuilder)
   - Support both prefix commands (`!command`) and slash commands
   - Always check user permissions before executing privileged commands
   - Provide clear error messages and usage hints

### Key Features to Maintain

1. **Anti-Raid System**: Monitors rapid joins and auto-locks down server
2. **Anti-Nuke Protection**: Tracks mass deletions of channels/roles
3. **Admin Monitoring**: Progressive punishment for admin abuse (warn → remove roles → ban)
4. **Ticket System**: Support ticket management with staff assignment
5. **Skeeter Protection**: Special protection for designated protected users

### Database Operations

- Use prepared statements to prevent SQL injection
- Always close database connections properly
- Handle connection errors gracefully
- Use connection pooling (configured in config.json)

### Configuration Management

Configuration is stored in `config.json` with these main sections:
- `token`, `clientId`: Discord bot credentials
- `logChannelId`: Channel for security logs
- `adminRoleIds`, `ownerIds`, `protectedUsers`: Access control
- `antiRaid`, `antiNuke`, `adminMonitoring`: Protection settings
- `database`: MySQL connection details
- `ticketSystem`: Support ticket configuration

## Build and Run Commands

### Node.js Bot
```bash
npm install              # Install dependencies
npm start               # Start main bot (bot.js)
npm run dev             # Start with nodemon (auto-restart)
npm run register        # Register slash commands
npm run dashboard       # Start web dashboard
npm run full            # Start full system (guardian.js)
```

### Python Bot
```bash
pip install -r requirements.txt  # Install Python dependencies
python discord_bot.py           # Run Python bot
python dashboard_app.py         # Run Python dashboard
```

## Testing and Validation

### Manual Testing
- Test anti-raid by simulating rapid joins in a test server
- Test admin monitoring with multiple admin actions
- Test ticket system by creating and closing tickets
- Verify lockdown/unlock commands work correctly
- Test database connectivity before deployment

### Testing Checklist
- [ ] Bot connects and shows online status
- [ ] Slash commands register properly
- [ ] Permission checks work for admin commands
- [ ] Log channel receives events
- [ ] Database connections succeed
- [ ] Error messages display correctly

## Common Tasks

### Adding a New Command
1. Add command definition to `bot.js` or appropriate module
2. Register slash command in `register_commands.js`
3. Implement permission checks
4. Add logging for the command execution
5. Update help command and documentation

### Modifying Protection Settings
1. Update config schema in `config.json` and `config.template.json`
2. Update initialization in relevant class (GuardianBot)
3. Test with various threshold values
4. Document new settings in README.md

### Database Schema Changes
1. Update `DatabaseManager.js` initialization
2. Test migration on clean database
3. Update backup/restore logic if needed
4. Document schema in code comments

## Deployment Notes

- Bot is deployed on PebbleHost (see PEBBLEHOST_DEPLOYMENT.md)
- MySQL database is hosted externally
- Dashboard can run on port 3000 (configurable)
- Environment variables not used; config.json used instead

## Important Files to Review

- `README.md`: Main documentation
- `SETUP.md`: Setup instructions
- `config.template.json`: Configuration structure reference
- `DISCORD_2025_SETUP.md`: Modern Discord bot setup guide
- `BOT_CRASH_FIX.md`: Troubleshooting guide

## Code Review Guidelines

When reviewing or modifying code:
1. Ensure backward compatibility with existing servers
2. Maintain existing command syntax unless explicitly changing
3. Don't break existing protection features
4. Test permission checks thoroughly
5. Verify database operations are safe
6. Check for potential memory leaks in trackers (Maps)
7. Ensure error handling doesn't expose sensitive data

## Anti-Patterns to Avoid

- ❌ Don't hardcode Discord IDs (use config.json)
- ❌ Don't expose bot token or database credentials
- ❌ Don't make breaking changes to command syntax without versioning
- ❌ Don't remove existing protection features without discussion
- ❌ Don't forget to clean up event listeners and intervals
- ❌ Don't use synchronous file operations in event handlers

## Helpful Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [discord.py Documentation](https://discordpy.readthedocs.io/)

## Special Considerations

### "Skeeter Protection" Feature
The bot includes special protection for user(s) listed in `protectedUsers` config. Any admin action targeting these users triggers immediate warnings and potential punishment. This is a critical feature - maintain it carefully.

### Trump-Style Responses
The bot includes colorful warning messages. When modifying these:
- Keep the humorous tone consistent
- Ensure language is appropriate for the server context
- Maintain the array structure for random selection

## Getting Started for New Contributors

1. Clone the repository
2. Copy `config.template.json` to `config.json`
3. Fill in your Discord bot credentials
4. Run `npm install`
5. Create a test Discord server
6. Run `npm run register` to register commands
7. Run `npm start` to start the bot
8. Test basic commands in your test server

## Summary

When working with this codebase:
- **Prioritize security**: This bot has significant server permissions
- **Test thoroughly**: Protection features are critical
- **Document changes**: Update README and relevant docs
- **Maintain compatibility**: Many servers depend on this bot
- **Ask before breaking changes**: Coordinate with maintainers
