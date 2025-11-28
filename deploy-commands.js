const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and status'),
    
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check bot status, uptime, and system information'),
    
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user and track warnings')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check warnings for (leave blank for yourself)')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('removewarn')
        .setDescription('Remove warnings from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove warnings from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('number')
                .setDescription('Warning number to remove (or "all" for all warnings)')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user for a specified duration')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes (1-1440, default: 60)')
                .setMinValue(1)
                .setMaxValue(1440)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove timeout/mute from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the unmute')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Lock down server or specific channel')
        .addStringOption(option =>
            option.setName('channel')
                .setDescription('Channel name to lock (leave blank for server-wide)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for lockdown')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock server or specific channel')
        .addStringOption(option =>
            option.setName('channel')
                .setDescription('Channel name to unlock (leave blank for server-wide)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unlock')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('raid')
        .setDescription('Announce raid alert with dramatic response'),
    
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send message as bot (Owner only)')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to send')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Send embed message as bot (Owner only)')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to send as embed')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Send DM through bot (Owner only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to send DM to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to send')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get server information and statistics'),
    
    new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Get bot information and statistics'),
    
    new SlashCommandBuilder()
        .setName('staffstats')
        .setDescription('View staff activity statistics and leaderboard')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('View stats for specific staff member')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Number of days to analyze (default: 7)')
                .setMinValue(1)
                .setMaxValue(365)
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Access the GuardianBot dashboard'),
    
    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your current level, rank, and XP progress (no automatic level notifications)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('View rank for a specific user')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server XP leaderboard')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Leaderboard page to view (default: 1)')
                .setMinValue(1)
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('addcommand')
        .setDescription('Create a custom command (Admin only)')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Command name (without !)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('response')
                .setDescription('Command response (use {user}, {server}, etc.)')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('delete_trigger')
                .setDescription('Delete the trigger message')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('dm_response')
                .setDescription('Send response as DM')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('removecommand')
        .setDescription('Delete a custom command (Admin only)')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Command name to delete')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('commands')
        .setDescription('List all custom commands'),
    
    new SlashCommandBuilder()
        .setName('rolereward')
        .setDescription('Add a role reward for reaching a level (Admin only)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to reward')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Required level')
                .setMinValue(1)
                .setMaxValue(1000)
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('remove_previous')
                .setDescription('Remove previous level roles')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands'),
    
    new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure auto-moderation settings (Admin only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('View current auto-moderation settings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('invites')
                .setDescription('Toggle Discord invite link filtering')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable invite filtering')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('violations')
                .setDescription('View recent auto-moderation violations')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('View violations for specific user')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Number of violations to show (default: 10)')
                        .setMinValue(1)
                        .setMaxValue(50)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View auto-moderation statistics')
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Number of days to analyze (default: 7)')
                        .setMinValue(1)
                        .setMaxValue(30)
                        .setRequired(false)))
];

// Convert to JSON for API
const commandData = commands.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('🔄 Started refreshing application (/) commands.');

        // Register commands globally (takes up to 1 hour to update)
        // For faster testing, you can register to specific guild instead:
        // await rest.put(Routes.applicationGuildCommands(config.clientId, 'YOUR_GUILD_ID'), { body: commandData });
        
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commandData }
        );

        console.log('✅ Successfully reloaded application (/) commands globally.');
        console.log(`📊 Registered ${commandData.length} slash commands.`);
        console.log('⏰ Commands may take up to 1 hour to appear in all servers.');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
})();