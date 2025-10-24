const { REST, Routes } = require('discord.js');
const config = require('./config.json');

// Modern Discord Application Commands Registration
// Based on Discord.dev 2025 documentation

const commands = [
    // Ticket System Commands (User and Guild installable)
    {
        name: 'ticket',
        description: 'Create a new support ticket',
        type: 1, // CHAT_INPUT
        contexts: [0, 1, 2], // GUILD, BOT_DM, PRIVATE_CHANNEL
        integration_types: [0, 1] // GUILD_INSTALL, USER_INSTALL
    },
    {
        name: 'claim-ticket',
        description: 'Claim a support ticket (Staff only)',
        type: 1,
        contexts: [0], // GUILD only
        integration_types: [0], // GUILD_INSTALL only
        default_member_permissions: '0' // Admin only
    },
    {
        name: 'close-ticket',
        description: 'Close a support ticket',
        type: 1,
        contexts: [0], // GUILD only
        integration_types: [0] // GUILD_INSTALL only
    },
    {
        name: 'ticket-panel',
        description: 'Create a ticket panel with buttons (Admin only)',
        type: 1,
        contexts: [0], // GUILD only
        integration_types: [0], // GUILD_INSTALL only
        default_member_permissions: '8' // Administrator
    },
    {
        name: 'ticket-stats',
        description: 'View ticket system statistics',
        type: 1,
        contexts: [0, 1, 2], // All contexts
        integration_types: [0, 1] // Both install types
    },
    {
        name: 'ticket-transcript',
        description: 'Generate a ticket transcript',
        type: 1,
        contexts: [0], // GUILD only
        integration_types: [0] // GUILD_INSTALL only
    },

    // Trump AI Commands (Entertainment)
    {
        name: 'trump',
        description: 'Get a Trump-style response',
        type: 1,
        contexts: [0, 1, 2], // All contexts
        integration_types: [0, 1], // Both install types
        options: [
            {
                type: 3, // STRING
                name: 'topic',
                description: 'What should Trump respond about?',
                required: false
            }
        ]
    },

    // Security Commands
    {
        name: 'skeeter-check',
        description: 'Check Skeeter protection status',
        type: 1,
        contexts: [0, 1, 2], // All contexts
        integration_types: [0, 1] // Both install types
    },

    // Moderation Commands
    {
        name: 'warn',
        description: 'Issue a warning to a user',
        type: 1,
        contexts: [0], // GUILD only
        integration_types: [0], // GUILD_INSTALL only
        default_member_permissions: '1099511627776', // MODERATE_MEMBERS
        options: [
            {
                type: 6, // USER
                name: 'user',
                description: 'User to warn',
                required: true
            },
            {
                type: 3, // STRING
                name: 'reason',
                description: 'Reason for the warning',
                required: true
            }
        ]
    },
    {
        name: 'warnings',
        description: 'View warnings for a user',
        type: 1,
        contexts: [0], // GUILD only
        integration_types: [0], // GUILD_INSTALL only
        default_member_permissions: '1099511627776', // MODERATE_MEMBERS
        options: [
            {
                type: 6, // USER
                name: 'user',
                description: 'User to check warnings for',
                required: false
            },
            {
                type: 5, // BOOLEAN
                name: 'show-removed',
                description: 'Include removed warnings',
                required: false
            }
        ]
    },
    {
        name: 'removewarn',
        description: 'Remove a warning by ID',
        type: 1,
        contexts: [0], // GUILD only
        integration_types: [0], // GUILD_INSTALL only
        default_member_permissions: '1099511627776', // MODERATE_MEMBERS
        options: [
            {
                type: 4, // INTEGER
                name: 'warning-id',
                description: 'ID of the warning to remove',
                required: true
            },
            {
                type: 3, // STRING
                name: 'reason',
                description: 'Reason for removing the warning',
                required: false
            }
        ]
    },

    // General Commands
    {
        name: 'status',
        description: 'Check Guardian Bot status and statistics',
        type: 1,
        contexts: [0, 1, 2], // All contexts
        integration_types: [0, 1] // Both install types
    },

    // Admin Commands
    {
        name: 'setup',
        description: 'Set up Guardian Bot for your server (Admin only)',
        type: 1,
        contexts: [0], // GUILD only
        integration_types: [0], // GUILD_INSTALL only
        default_member_permissions: '8' // Administrator
    }
];

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    try {
        console.log('🔄 Started refreshing application (/) commands...');
        console.log(`📊 Registering ${commands.length} commands with modern Discord API`);
        
        // Register global commands (works for both guild and user installs)
        const data = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        
        console.log('✅ Successfully reloaded application (/) commands!');
        console.log(`📋 Registered commands: ${data.map(cmd => `/${cmd.name}`).join(', ')}`);
        console.log('');
        console.log('🌟 MODERN DISCORD FEATURES ENABLED:');
        console.log('✅ User-installable apps (works in DMs)');
        console.log('✅ Guild-installable apps (works in servers)');
        console.log('✅ Context-aware commands');
        console.log('✅ Proper permission handling');
        console.log('✅ 2025 Discord API compliance');
        console.log('');
        console.log('🔗 INSTALLATION LINKS:');
        console.log(`Guild Install: https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`);
        console.log(`User Install: https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&scope=applications.commands`);
        
    } catch (error) {
        console.error('❌ Error registering commands:', error);
        
        if (error.code === 50001) {
            console.log('💡 Missing Access: Make sure your bot has the "applications.commands" scope');
        }
        if (error.code === 50013) {
            console.log('💡 Missing Permissions: Check your bot\'s permissions in the Discord Developer Portal');
        }
    }
}

if (require.main === module) {
    registerCommands();
}

module.exports = { registerCommands };