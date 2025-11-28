const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const DatabaseManager = require('./src/DatabaseManager');
const DashboardServer = require('./dashboard-server');

class GuardianBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                // GatewayIntentBits.GuildMembers, // Privileged - enable in Discord Developer Portal
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent, // Privileged - enable in Discord Developer Portal
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildModeration
                // GatewayIntentBits.GuildPresences // Privileged - enable in Discord Developer Portal
            ]
        });

        // Tracking objects for monitoring
        this.joinTracker = new Map(); // guildId -> array of join timestamps
        this.warningTracker = new Map(); // userId -> array of warning objects
        this.adminActions = new Map(); // userId -> array of action timestamps
        this.mutedUsers = new Map(); // userId -> unmute timestamp
        this.protectedMembers = new Set(); // Set of protected user IDs
        
        // Initialize database manager
        this.dbManager = new DatabaseManager();
        
        this.setupEventHandlers();
    }

    getTrumpResponse(category, replacements = {}) {
        const responses = config.trump.responses[category];
        if (!responses || responses.length === 0) return "This is tremendous, believe me!";
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Replace placeholders
        let finalResponse = response;
        for (const [key, value] of Object.entries(replacements)) {
            finalResponse = finalResponse.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        
        return finalResponse;
    }

    getElonResponse(category, replacements = {}) {
        const responses = config.elon.responses[category];
        if (!responses || responses.length === 0) return "This is actually quite fascinating. We should iterate on this.";
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Replace placeholders
        let finalResponse = response;
        for (const [key, value] of Object.entries(replacements)) {
            finalResponse = finalResponse.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        
        return finalResponse;
    }

    // Mixed Trump/Elon Response System
    getMixedResponse(category, replacements = {}) {
        // Randomly choose between Trump and Elon responses
        const useTrump = Math.random() < 0.5;
        return useTrump ? this.getTrumpResponse(category, replacements) : this.getElonResponse(category, replacements);
    }

    // Detect if user is being aggressive/rude to the bot
    isAggressiveMessage(content) {
        const aggressiveWords = [
            // Direct insults
            'shut up', 'fuck off', 'go away', 'stupid', 'dumb', 'idiot', 'moron', 'retard',
            'stfu', 'shutup', 'piss off', 'screw you', 'damn bot', 'useless', 'trash',
            'garbage', 'piece of shit', 'pos', 'asshole', 'bitch', 'suck', 'worst',
            'hate you', 'kill yourself', 'kys', 'die', 'annoying', 'cringe', 'lame',
            
            // Trash talking phrases
            'talk shit', 'talking crap', 'fuck you', 'go die', 'nobody likes you',
            'you suck', 'terrible bot', 'worst bot', 'delete yourself', 'uninstall',
            'broken bot', 'dumbass bot', 'shitty bot', 'pathetic', 'loser bot',
            'nobody cares', 'stfu bot', 'mute yourself', 'go offline', 'trash bot',
            
            // Dismissive/disrespectful  
            'whatever', 'dont care', "don't care", 'who asked', 'didnt ask', "didn't ask",
            'boring', 'lame ass', 'weak', 'crappy', 'dogshit', 'shit bot', 'crap bot',
            'gtfo', 'get lost', 'piss me off', 'get bent', 'buzz off', 'beat it'
        ];
        
        const normalizedContent = content.toLowerCase();
        
        // Check for direct aggressive words/phrases
        const hasAggressiveWords = aggressiveWords.some(word => normalizedContent.includes(word));
        
        // Check for aggressive patterns (multiple question marks, excessive caps, etc.)
        const hasAggressivePattern = /(\?{3,})|([A-Z]{4,})|(!{3,})/.test(content);
        
        // Check for specific bot-targeting insults
        const botTargetedInsults = [
            'guardian is', 'this bot is', 'guardianbot is', 'guardian sucks',
            'bot you are', 'you are a', 'you\'re a', 'youre a'
        ];
        const hasBoTTargetedInsults = botTargetedInsults.some(phrase => 
            normalizedContent.includes(phrase) && 
            aggressiveWords.some(insult => normalizedContent.includes(insult))
        );
        
        return hasAggressiveWords || hasAggressivePattern || hasBoTTargetedInsults;
    }

    setupEventHandlers() {
        this.client.on('clientReady', async () => {
            console.log(`🚀 ${this.client.user.tag} is online!`);
            console.log(`🌐 Guild cache size: ${this.client.guilds.cache.size}`);
            console.log(`🌐 Available guilds: ${this.client.guilds.cache.map(g => g.name).join(', ')}`);
            
            // Set bot activity/status with dashboard link
            this.client.user.setActivity(`🛡️ Protecting Discord | Dashboard: ${process.env.DOMAIN ? process.env.DOMAIN.replace(/https?:\/\//, '') : 'localhost:3000'}`, { 
                type: 3 // WATCHING activity type
            });
            
            // Connect to database
            const dbConnected = await this.dbManager.connect();
            if (dbConnected) {
                console.log('✅ Database connected successfully');
            } else {
                console.log('❌ Database connection failed');
            }
        });

        this.client.on('guildBanAdd', async (ban) => {
            // Check if the banned user is protected
            if (config.protectedUsers && config.protectedUsers.includes(ban.user.id)) {
                try {
                    await ban.guild.members.unban(ban.user.id, 'Protected user - auto unban');
                    
                    const protectionEmbed = new EmbedBuilder()
                        .setTitle('🛡️ PROTECTED USER UNBANNED')
                        .setDescription(`Protected user ${ban.user.tag} was automatically unbanned`)
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '👤 User', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
                            { name: '🛡️ Status', value: 'Protected User', inline: true },
                            { name: '⚡ Action', value: 'Automatic Unban', inline: true }
                        )
                        .setTimestamp();

                    const logChannelId = config.logChannelId;
                    if (logChannelId) {
                        const logChannel = ban.guild.channels.cache.get(logChannelId);
                        if (logChannel) {
                            await logChannel.send({ embeds: [protectionEmbed] });
                        }
                    }
                } catch (error) {
                    console.error('Error unbanning protected user:', error);
                }
            }
            
            this.handleAdminAction(ban.guild, 'ban');
            this.logEvent(ban.guild, 'User Banned', `${ban.user.tag} was banned`, 0xff0000);
        });

        this.client.on('guildMemberAdd', (member) => {
            this.handleAntiRaid(member);
        });

        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
            // Monitor timeout changes (mutes)
            if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil && 
                newMember.communicationDisabledUntil) {
                this.handleAdminAction(newMember.guild, 'timeout');
            }
            
            // Monitor role changes with detailed logging
            if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
                this.handleAdminAction(newMember.guild, 'roleChange');
                
                // Log role changes for all servers
                if (config.logging?.enabled) {
                    this.logMemberRoleChanges(oldMember, newMember);
                }
            }
        });

        // Enhanced role event handlers for comprehensive logging
        this.client.on('roleCreate', (role) => {
            // Log role creation for all servers
            if (config.logging?.enabled) {
                this.logRoleAction(role.guild, 'ROLE_CREATE', role, null, null);
            }
        });

        this.client.on('roleUpdate', (oldRole, newRole) => {
            // Log role updates for all servers
            if (config.logging?.enabled) {
                this.logRoleAction(oldRole.guild, 'ROLE_UPDATE', newRole, oldRole, null);
            }
        });

        this.client.on('roleDelete', async (role) => {
            await this.handleRoleDelete(role);
        });

        this.client.on('channelDelete', async (channel) => {
            await this.handleChannelDelete(channel);
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            
            // Auto-moderation check (before processing XP)
            if (message.guild && !message.author.bot) {
                const autoModResult = await this.handleAutoModeration(message);
                if (autoModResult && autoModResult.deleted) {
                    return; // Message was deleted, don't process further
                }
            }
            
            // XP system - Award XP for messages
            if (message.guild && !message.author.bot && this.dbManager && this.dbManager.isConnected) {
                try {
                    const xpGain = Math.floor(Math.random() * 25) + 15; // 15-40 XP per message
                    const xpResult = await this.dbManager.addUserXP(
                        message.guild.id,
                        message.author.id,
                        message.author.username,
                        xpGain
                    );

                    // Handle level up
                    if (xpResult.gained && xpResult.levelUp) {
                        await this.handleLevelUp(message, xpResult);
                    }
                } catch (error) {
                    console.error('Error adding user XP:', error);
                }
            }

            // Check for custom commands first
            if (message.guild && message.content.startsWith('!')) {
                const commandName = message.content.slice(1).split(' ')[0].toLowerCase();
                const customCommand = await this.dbManager.getCustomCommand(message.guild.id, commandName);
                
                if (customCommand) {
                    await this.handleCustomCommand(message, customCommand);
                    return;
                }
            }
            
            // Track staff activity for messages
            if (message.guild) {
                const member = message.member;
                if (member && this.hasPermission(member)) {
                    try {
                        await this.dbManager.logStaffActivity(
                            message.guild.id,
                            message.author.id,
                            message.author.username,
                            'message',
                            message.channel.id,
                            message.channel.name,
                            {
                                messageLength: message.content.length,
                                hasAttachments: message.attachments.size > 0,
                                channelType: message.channel.type
                            }
                        );
                    } catch (error) {
                        console.error('Error tracking staff message activity:', error);
                    }
                }
            }
            
            // Unified bot mention detection system
            if (this.checkBotMention(message)) {
                // Randomly choose between Trump and Elon for general bot mentions
                const useElon = Math.random() < 0.5;
                if (useElon) {
                    this.handleElonMention(message);
                } else {
                    this.handleTrumpMention(message);
                }
            }
            // Check for specific Elon keywords only
            else if (this.checkSpecificElonMention(message)) {
                this.handleElonMention(message);
            }
            
            // Check for server owner mentions with protection
            if (this.checkOwnerMention(message)) {
                console.log(`🚨 Server owner mention detected from ${message.author.username}: ${message.content}`);
                this.handleOwnerMention(message);
            }
        });

        // Handle slash commands
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            
            // Track staff command usage
            if (interaction.guild && interaction.member && this.hasPermission(interaction.member)) {
                try {
                    await this.dbManager.logStaffActivity(
                        interaction.guild.id,
                        interaction.user.id,
                        interaction.user.username,
                        'command',
                        interaction.channel?.id,
                        interaction.channel?.name,
                        {
                            commandName: interaction.commandName,
                            options: interaction.options.data.map(opt => ({ name: opt.name, type: opt.type })),
                            isModeration: ['ban', 'kick', 'mute', 'unmute', 'timeout', 'warn'].includes(interaction.commandName)
                        }
                    );
                } catch (error) {
                    console.error('Error tracking staff command activity:', error);
                }
            }
            
            await this.handleSlashCommand(interaction);
        });

        this.client.on('error', console.error);
        this.client.on('warn', console.warn);
        
        // Track voice channel activity for staff
        this.client.on('voiceStateUpdate', async (oldState, newState) => {
            const member = newState.member || oldState.member;
            if (!member || member.user.bot) return;
            
            // Only track staff voice activity
            if (this.hasPermission(member)) {
                try {
                    const guild = newState.guild || oldState.guild;
                    
                    // User joined a voice channel
                    if (!oldState.channel && newState.channel) {
                        await this.dbManager.logStaffActivity(
                            guild.id,
                            member.user.id,
                            member.user.username,
                            'voice_join',
                            newState.channel.id,
                            newState.channel.name,
                            {
                                channelType: 'voice',
                                memberCount: newState.channel.members.size
                            }
                        );
                    }
                    
                    // User left a voice channel
                    if (oldState.channel && !newState.channel) {
                        await this.dbManager.logStaffActivity(
                            guild.id,
                            member.user.id,
                            member.user.username,
                            'voice_leave',
                            oldState.channel.id,
                            oldState.channel.name,
                            {
                                channelType: 'voice',
                                memberCount: oldState.channel.members.size
                            }
                        );
                    }
                } catch (error) {
                    console.error('Error tracking staff voice activity:', error);
                }
            }
        });
    }

    // Anti-Raid System
    async handleAntiRaid(member) {
        if (!config.antiRaid.enabled) return;

        const guild = member.guild;
        const now = Date.now();
        
        if (!this.joinTracker.has(guild.id)) {
            this.joinTracker.set(guild.id, []);
        }

        const joins = this.joinTracker.get(guild.id);
        joins.push(now);

        // Clean old entries
        const validJoins = joins.filter(time => now - time < config.antiRaid.timeWindow);
        this.joinTracker.set(guild.id, validJoins);

        if (validJoins.length >= config.antiRaid.joinThreshold) {
            await this.triggerRaidProtection(guild, validJoins.length);
        }
    }

    async triggerRaidProtection(guild, joinCount) {
        const trumpTrashTalk = this.getTrumpResponse('raidDetected', { count: joinCount });
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 RAID DETECTED!')
            .setDescription(`**${trumpTrashTalk}**`)
            .setColor(0xff0000)
            .addFields(
                { name: '🎯 TRUMP SAYS', value: 'These raiders are LOSERS! Total losers!', inline: false },
                { name: '📊 Detection Stats', value: `${joinCount} joins in ${config.antiRaid.timeWindow/1000} seconds`, inline: false }
            )
            .setTimestamp();

        await this.sendToLogChannel(guild, embed);

        if (config.antiRaid.lockdownOnRaid) {
            const lockdownMessage = this.getTrumpResponse('lockdown');
            await this.lockdownServer(guild, `Auto-lockdown: ${trumpTrashTalk}`);
        }

        // Kick recent joiners if configured
        if (config.antiRaid.punishmentType === 'kick') {
            const recentMembers = guild.members.cache.filter(member => 
                Date.now() - member.joinedTimestamp < config.antiRaid.timeWindow
            );
            
            for (const [, member] of recentMembers) {
                if (!config.protectedUsers.includes(member.id)) {
                    try {
                        await member.kick('Anti-raid protection');
                    } catch (error) {
                        console.error(`Failed to kick ${member.user.tag}:`, error);
                    }
                }
            }
        }
    }

    // Enhanced Channel Delete Handler with Audit Log Tracking
    async handleChannelDelete(channel) {
        try {
            // Log the basic deletion
            this.logEvent(channel.guild, 'Channel Deleted', `Channel #${channel.name} was deleted`, 0xff0000);
            
            // Check if bot has permissions to read audit logs
            const botMember = channel.guild.members.cache.get(this.client.user.id);
            if (!botMember || !botMember.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
                console.error('Bot missing VIEW_AUDIT_LOG permission - cannot identify channel deleter');
                return;
            }
            
            // Get audit logs to find who deleted the channel
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: 12, // CHANNEL_DELETE
                limit: 1
            });
            
            const auditEntry = auditLogs.entries.first();
            if (!auditEntry) {
                console.error('Could not find audit log entry for channel deletion');
                return;
            }
            
            // Check if audit entry is recent (within last 5 seconds)
            const timeDiff = Date.now() - auditEntry.createdTimestamp;
            if (timeDiff > 5000) {
                console.log('Audit log entry too old, likely not related to this deletion');
                return;
            }
            
            const executor = auditEntry.executor;
            if (!executor || executor.bot) {
                // Skip bot deletions or unknown executors
                console.log('Channel deleted by bot or unknown executor, skipping anti-nuke check');
                return;
            }
            
            console.log(`🚨 Channel "${channel.name}" deleted by ${executor.tag} (${executor.id})`);
            
            // Track this deletion by the specific user
            await this.handleAntiNukeUser(channel.guild, 'channelDelete', executor, channel.name);
            
        } catch (error) {
            console.error('Error handling channel deletion:', error);
            // If we can't get audit logs, log a warning but don't crash
            console.log('⚠️ Failed to track channel deleter - audit log access may be restricted');
        }
    }

    // Enhanced Role Delete Handler with Audit Log Tracking
    async handleRoleDelete(role) {
        try {
            // Log the basic deletion
            this.logEvent(role.guild, 'Role Deleted', `Role @${role.name} was deleted`, 0xff0000);
            
            // Only log role changes for Triple Threat Tactical server
            if (config.logging?.roleLoggingGuildId && role.guild.id === config.logging.roleLoggingGuildId) {
                this.logRoleAction(role.guild, 'ROLE_DELETE', role, null, null);
            }
            
            // Check if bot has permissions to read audit logs
            const botMember = role.guild.members.cache.get(this.client.user.id);
            if (!botMember || !botMember.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
                console.error('Bot missing VIEW_AUDIT_LOG permission - cannot identify role deleter');
                return;
            }
            
            // Get audit logs to find who deleted the role
            const auditLogs = await role.guild.fetchAuditLogs({
                type: 32, // ROLE_DELETE
                limit: 1
            });
            
            const auditEntry = auditLogs.entries.first();
            if (!auditEntry) {
                console.error('Could not find audit log entry for role deletion');
                return;
            }
            
            // Check if audit entry is recent (within last 5 seconds)
            const timeDiff = Date.now() - auditEntry.createdTimestamp;
            if (timeDiff > 5000) {
                console.log('Audit log entry too old, likely not related to this deletion');
                return;
            }
            
            const executor = auditEntry.executor;
            if (!executor || executor.bot) {
                // Skip bot deletions or unknown executors
                console.log('Role deleted by bot or unknown executor, skipping anti-nuke check');
                return;
            }
            
            console.log(`🚨 Role "${role.name}" deleted by ${executor.tag} (${executor.id})`);
            
            // Track this deletion by the specific user
            await this.handleAntiNukeUser(role.guild, 'roleDelete', executor, role.name);
            
        } catch (error) {
            console.error('Error handling role deletion:', error);
            // If we can't get audit logs, log a warning but don't crash
            console.log('⚠️ Failed to track role deleter - audit log access may be restricted');
        }
    }

    // Enhanced Anti-Nuke System with User Tracking
    async handleAntiNukeUser(guild, actionType, user, targetName = '') {
        if (!config.antiNuke.enabled) return;

        const threshold = actionType === 'channelDelete' ? config.antiNuke.channelDeleteThreshold : config.antiNuke.roleDeleteThreshold;
        
        // Track actions per user
        const key = `${guild.id}-${user.id}-${actionType}`;
        if (!this.adminActions.has(key)) {
            this.adminActions.set(key, []);
        }

        const actions = this.adminActions.get(key);
        const now = Date.now();
        actions.push({ timestamp: now, target: targetName });

        // Clean old entries
        const validActions = actions.filter(action => now - action.timestamp < config.antiNuke.timeWindow);
        this.adminActions.set(key, validActions);

        console.log(`🚨 Anti-nuke tracking: ${user.tag} performed ${actionType} on "${targetName}" - ${validActions.length}/${threshold}`);

        if (validActions.length >= threshold) {
            await this.triggerNukeProtectionForUser(guild, actionType, validActions.length, user, validActions);
        }
    }

    // Enhanced Nuke Protection with User Banning
    async triggerNukeProtectionForUser(guild, actionType, actionCount, executor, actionHistory) {
        // Don't ban protected users or server owners
        if (config.protectedUsers?.includes(executor.id) || 
            config.ownerIds?.includes(executor.id) || 
            executor.id === guild.ownerId) {
            console.log(`⚠️ Anti-nuke triggered by protected user ${executor.tag} - logging only, no ban`);
            
            const protectedEmbed = new EmbedBuilder()
                .setTitle('🚨 NUKE ATTEMPT BY PROTECTED USER!')
                .setDescription(`**${executor.tag}** performed rapid ${actionType} but is protected from auto-ban`)
                .setColor(0xff9900)
                .addFields(
                    { name: '⚠️ Action Type', value: actionType, inline: true },
                    { name: '🛡️ Protected User', value: `${executor.tag} (${executor.id})`, inline: true },
                    { name: '📊 Count', value: `${actionCount} in ${config.antiNuke.timeWindow/1000}s`, inline: true }
                )
                .setFooter({ text: 'GuardianBot -- Protected user detected in anti-nuke system' })
                .setTimestamp();

            await this.sendToLogChannel(guild, protectedEmbed);
            return;
        }
        
        const targetList = actionHistory.map(action => action.target).slice(-3).join(', ');
        
        const trumpResponse = this.getTrumpResponse('nukeDetected', { 
            type: actionType, 
            count: actionCount,
            user: executor.tag
        });
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 NUKE ATTEMPT DETECTED!')
            .setDescription(`**${trumpResponse}**\n\n**NUKER IDENTIFIED: ${executor.tag}**`)
            .setColor(0xff0000)
            .addFields(
                { name: '⚠️ Action Type', value: actionType, inline: true },
                { name: '🔥 Nuker', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '📊 Count', value: `${actionCount} in ${config.antiNuke.timeWindow/1000}s`, inline: true },
                { name: '🎯 Recent Targets', value: targetList.substring(0, 1024), inline: false },
                { name: '🛡️ Response', value: 'Auto-ban + Server lockdown', inline: false }
            )
            .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
            .setTimestamp();

        await this.sendToLogChannel(guild, embed);

        // Ban the nuker immediately
        try {
            if (config.antiNuke.banNukers) {
                const member = await guild.members.fetch(executor.id);
                if (member) {
                    await member.ban({ 
                        reason: `Anti-nuke protection: ${actionType} spam (${actionCount} in ${config.antiNuke.timeWindow/1000}s)`,
                        deleteMessageDays: 1
                    });
                    
                    const banEmbed = new EmbedBuilder()
                        .setTitle('🔨 NUKER BANNED!')
                        .setDescription(`**${executor.tag}** has been permanently banned for nuke attempt!`)
                        .setColor(0xff0000)
                        .addFields(
                            { name: '🔥 Banned User', value: `${executor.tag} (${executor.id})`, inline: true },
                            { name: '⚡ Reason', value: `${actionType} spam detected`, inline: true },
                            { name: '📊 Evidence', value: `${actionCount} rapid ${actionType} actions`, inline: true }
                        )
                        .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                        .setTimestamp();
                    
                    await this.sendToLogChannel(guild, banEmbed);
                }
            }
        } catch (banError) {
            console.error('Failed to ban nuker:', banError);
        }

        // Lock down the server to prevent further damage
        await this.lockdownServer(guild, `Anti-nuke protection: ${actionType} spam by ${executor.tag}`);
    }

    handleAdminAction(guild, actionType) {
        // Track admin actions for monitoring
        const key = `${guild.id}-admin-${actionType}`;
        if (!this.adminActions.has(key)) {
            this.adminActions.set(key, []);
        }
        
        const actions = this.adminActions.get(key);
        actions.push(Date.now());
        
        // Keep only recent actions
        const validActions = actions.filter(time => 
            Date.now() - time < 300000 // 5 minutes
        );
        this.adminActions.set(key, validActions);
    }

    // Unified Bot Mention Detection System - ONLY @mentions
    checkBotMention(message) {
        // Don't respond to @everyone or @tttmember mentions
        if (message.mentions.everyone || 
            message.content.toLowerCase().includes('@everyone') ||
            message.content.toLowerCase().includes('@tttmember')) {
            return false;
        }

        // Don't respond to replies - only direct mentions
        if (message.reference && message.reference.messageId) {
            return false;
        }
        
        // ONLY respond to direct @mentions of the bot - no keyword triggers
        return message.mentions.has(this.client.user);
    }

    // Specific Elon Detection - DISABLED
    checkSpecificElonMention(message) {
        // Disabled - bot only responds to @mentions now
        return false;
    }

    async handleTrumpMention(message) {
        // Check if user is being aggressive
        const isAggressive = this.isAggressiveMessage(message.content);
        const responseCategory = isAggressive ? 'aggressiveResponses' : 'generalResponses';
        
        const response = this.getMixedResponse(responseCategory, { 
            user: message.author.toString() 
        });
        
        // Extra savage mode for aggressive users
        let additionalTroll = '';
        if (isAggressive) {
            const trollLines = [
                '\n\n*Imagine getting roasted by a bot and still thinking you\'re winning* 💀',
                '\n\n*Did you really just try to talk tough to an AI? That\'s... concerning* 🤡',
                '\n\n*Your Discord privileges should come with training wheels* 🎪',
                '\n\n*I\'d feel bad for you, but my empathy protocols are reserved for actual humans* 🤖',
                '\n\n*Fun fact: You just got intellectually demolished by code. How does that feel?* 🔥'
            ];
            additionalTroll = trollLines[Math.floor(Math.random() * trollLines.length)];
        }
        
        const embed = new EmbedBuilder()
            .setDescription(response + additionalTroll)
            .setColor(isAggressive ? 0xff0000 : 0x1e3a8a)
            .setFooter({ text: isAggressive ? 'GuardianBot - Professional Troll Destroyer' : 'GuardianBot Security --- Professional Discord Protection' })
            .setTimestamp();
            
        // Add a reaction to really rub it in
        if (isAggressive) {
            try {
                await message.react('💀');
                await message.react('🤡');
            } catch (error) {
                // Ignore if can't react
            }
        }
            
        await message.reply({ embeds: [embed] });
    }

    // Elon Musk AI Response Handler
    async handleElonMention(message) {
        console.log(`🚀 Handling Elon mention from ${message.author.username}`);
        
        // Check if user is being aggressive
        const isAggressive = this.isAggressiveMessage(message.content);
        const responseCategory = isAggressive ? 'aggressiveResponses' : 'generalResponses';
        
        const elonResponse = this.getMixedResponse(responseCategory, { 
            user: message.author.toString() 
        });
        
        console.log(`🚀 Elon response: ${elonResponse}`);
        
        // Extra savage mode for aggressive users
        let additionalTroll = '';
        if (isAggressive) {
            const trollLines = [
                '\n\n*Congratulations on failing the Turing test... as a human* 🤖',
                '\n\n*Error 404: Your intelligence not found* 💻',
                '\n\n*You just got schooled by an algorithm. Let that sink in.* 🚀',
                '\n\n*I\'ve computed your probability of success: 0.000001%* 📊',
                '\n\n*My neural networks are laughing in binary right now* 💾'
            ];
            additionalTroll = trollLines[Math.floor(Math.random() * trollLines.length)];
        }
        
        const embed = new EmbedBuilder()
            .setDescription(elonResponse + additionalTroll)
            .setColor(isAggressive ? 0xff0000 : 0x00ff00)
            .setFooter({ text: isAggressive ? 'GuardianBot - Advanced Troll Termination System' : 'GuardianBot Security --- Professional Discord Protection' })
            .setTimestamp();
            
        // Add reactions to maximize the psychological damage
        if (isAggressive) {
            try {
                await message.react('🤖');
                await message.react('💀');
                await message.react('🔥');
            } catch (error) {
                // Ignore if can't react
            }
        }
            
        await message.reply({ embeds: [embed] });
    }

    // Server Owner Protection System
    checkOwnerMention(message) {
        // Don't respond to @everyone or @tttmember mentions
        if (message.mentions.everyone || 
            message.content.toLowerCase().includes('@everyone') ||
            message.content.toLowerCase().includes('@tttmember')) {
            return false;
        }

        // Don't respond to replies - only direct mentions
        if (message.reference && message.reference.messageId) {
            return false;
        }
        
        // Get all mentioned users
        const mentionedUsers = message.mentions.users;
        
        if (mentionedUsers.size === 0) return false;
        
        console.log(`🔍 Mentioned users: ${Array.from(mentionedUsers.values()).map(u => `${u.username}#${u.discriminator} (${u.id})`).join(', ')}`);
        
        // Check each mentioned user for server owner
        for (const [userId, user] of mentionedUsers) {
            // Check if mentioned user is the server owner
            if (user.id === message.guild.ownerId) {
                console.log(`✅ Found server owner mention: ${user.username} (${user.id})`);
                return true;
            }
        }
        
        console.log(`❌ No server owner match found in mentions`);
        return false;
    }

    async handleOwnerMention(message) {
        const ownerUser = message.guild.members.cache.get(message.guild.ownerId);
        const ownerName = ownerUser ? ownerUser.displayName : 'Server Owner';
        
        // Check if user is being aggressive towards the owner
        const isAggressive = this.isAggressiveMessage(message.content);
        const responseCategory = isAggressive ? 'aggressiveResponses' : 'ownerProtection';
        
        const mixedResponse = this.getMixedResponse(responseCategory, { 
            user: message.author.toString() 
        });
        
        const embed = new EmbedBuilder()
            .setTitle('🛡️ SERVER OWNER PROTECTION ACTIVATED!')
            .setDescription(`**${mixedResponse}**`)
            .setColor(isAggressive ? 0xff0000 : 0x00ff00)
            .addFields(
                { name: '🎯 GUARDIAN SAYS', value: `${ownerName} is under premium AI protection! The absolute best!`, inline: false },
                { name: isAggressive ? '🚨 FINAL WARNING' : '⚠️ WARNING', value: isAggressive ? `Back off NOW or face the consequences!` : `Think twice before messing with ${ownerName}!`, inline: false }
            )
            .setFooter({ text: 'GuardianBot -- Protecting Server Owners with Tremendous Efficiency' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
        
        // Try to DM the user a warning (more severe if aggressive)
        try {
            const dmMessage = isAggressive 
                ? `🚨 **FINAL WARNING** 🚨\n\n${mixedResponse}\n\nYou're on thin ice! Show respect to ${ownerName} or face the consequences!`
                : `🚨 **SERVER OWNER PROTECTION WARNING** 🚨\n\n${mixedResponse}\n\nBe respectful when mentioning ${ownerName}!`;
            await message.author.send(dmMessage);
        } catch (error) {
            console.log('Could not DM admin owner protection warning');
        }
    }

    // Auto-Moderation System
    async handleAutoModeration(message) {
        try {
            // Skip if user has moderation permissions
            if (message.member && this.hasPermission(message.member)) {
                return { deleted: false, reason: 'staff_bypass' };
            }

            // Check for hate speech/bad words first (highest priority)
            if (this.containsHateSpeech(message.content)) {
                return await this.handleHateSpeech(message);
            }

            // Check for Discord invite links
            if (this.containsDiscordInvite(message.content)) {
                return await this.handleInviteSpam(message);
            }

            // Add other auto-mod checks here in the future (spam, etc.)
            
            return { deleted: false, reason: 'clean' };
        } catch (error) {
            console.error('Error in auto-moderation:', error);
            return { deleted: false, reason: 'error' };
        }
    }

    containsDiscordInvite(content) {
        // Discord invite patterns
        const invitePatterns = [
            /discord\.gg\/[\w-]+/gi,
            /discord\.com\/invite\/[\w-]+/gi,
            /discordapp\.com\/invite\/[\w-]+/gi,
            /discord\.me\/[\w-]+/gi,
            /discord\.li\/[\w-]+/gi,
            /discord\.io\/[\w-]+/gi,
            /invite\.gg\/[\w-]+/gi
        ];

        return invitePatterns.some(pattern => pattern.test(content));
    }

    containsHateSpeech(content) {
        // Hate speech and offensive slurs - zero tolerance
        const hateSpeechWords = [
            'nigger', 'n1gger', 'n!gger', 'nig9er',
            'fag', 'faggot', 'f4g', 'f4ggot', 'f@g', 'f@ggot',
            'retard', 'retarded', 'r3tard', 'ret4rd',
            'tranny', 'tr@nny', 'tr4nny',
            'dyke', 'd1ke', 'd!ke',
            'spic', 'sp1c', 'sp!c',
            'chink', 'ch1nk', 'ch!nk',
            'gook', 'g00k', 'g0ok',
            'kike', 'k1ke', 'k!ke'
        ];

        // Normalize content for checking
        const normalizedContent = content.toLowerCase()
            .replace(/[0@!]/g, match => ({ '0': 'o', '@': 'a', '!': 'i' }[match] || match));

        return hateSpeechWords.some(word => {
            // Create regex with word boundaries to prevent false positives
            const normalizedWord = word.replace(/[0@!]/g, match => ({ '0': 'o', '@': 'a', '!': 'i' }[match] || match));
            const regex = new RegExp(`\\b${normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(normalizedContent);
        });
    }

    async handleHateSpeech(message) {
        try {
            // Delete the message immediately
            await message.delete();

            // Get user's hate speech violations specifically
            const violations = await this.dbManager.getAutoModViolations(
                message.guild.id, 
                message.author.id, 
                'hate_speech'
            );

            const violationCount = violations.length + 1; // +1 for current violation

            // Hate speech has stricter punishment: 24h mute → ban
            const punishment = this.getHateSpeechPunishment(violationCount);

            // Try to log the violation, but don't let it stop the warning
            try {
                await this.dbManager.logAutoModViolation(
                    message.guild.id,
                    message.author.id,
                    message.author.username,
                    'hate_speech',
                    message.content,
                    message.channel.id,
                    punishment.action
                );
            } catch (dbError) {
                console.error('Failed to log hate speech violation to database:', dbError);
                // Continue anyway - warning user is more important than logging
            }
            
            // Create public warning embed - more serious tone
            const warningEmbed = new EmbedBuilder()
                .setTitle('🚨 HATE SPEECH DETECTED')
                .setDescription(`**${message.author.toString()}** used prohibited hate speech!`)
                .addFields(
                    { name: '⛔ ZERO TOLERANCE POLICY', value: `Hate speech and slurs are strictly prohibited`, inline: false },
                    { name: '📊 Violation Count', value: `${violationCount}/2`, inline: true },
                    { name: '⚡ Action Taken', value: punishment.description, inline: true },
                    { name: '📝 Next Violation', value: punishment.next || 'No further warnings', inline: true }
                )
                .setColor(0xff0000)
                .setFooter({ text: 'GuardianBot Auto-Moderation | Hate speech will not be tolerated' })
                .setTimestamp();

            // Send public warning
            const warningMessage = await message.channel.send({ embeds: [warningEmbed] });

            // Execute the punishment
            await this.executeHateSpeechPunishment(message, punishment, violationCount);

            // Create log embed for staff channel
            const logEmbed = new EmbedBuilder()
                .setTitle('🚨 AUTO-MOD: Hate Speech Detected')
                .setDescription(`**User:** ${message.author.toString()} (${message.author.tag})\n**Channel:** ${message.channel.toString()}`)
                .addFields(
                    { name: '💬 Detected Content', value: `\`\`\`${message.content.substring(0, 1000)}\`\`\``, inline: false },
                    { name: '📊 Violation Count', value: `${violationCount}/2`, inline: true },
                    { name: '⚡ Action Taken', value: punishment.description, inline: true },
                    { name: '🕐 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setColor(0xff0000)
                .setFooter({ text: 'GuardianBot Auto-Moderation System' })
                .setTimestamp();

            // Send to staff log channel
            await this.sendToLogChannel(message.guild, logEmbed);

            // Auto-delete warning after 15 seconds (longer for serious violations)
            setTimeout(async () => {
                try {
                    await warningMessage.delete();
                } catch (error) {
                    // Message might already be deleted
                }
            }, 15000);

            return { deleted: true, punishment: punishment.action, violationCount };
        } catch (error) {
            console.error('Error handling hate speech:', error);
            return { deleted: false, reason: 'error' };
        }
    }

    getHateSpeechPunishment(violationCount) {
        const punishments = {
            1: { 
                action: 'mute_24h', 
                description: '🔇 **24-hour mute** - First hate speech violation', 
                next: 'Permanent ban' 
            },
            2: { 
                action: 'ban', 
                description: '🔨 **Permanent ban** - Second hate speech violation', 
                next: null 
            }
        };

        return punishments[violationCount] || punishments[2]; // Default to ban for 2+ violations
    }

    async executeHateSpeechPunishment(message, punishment, violationCount) {
        try {
            const member = message.member;
            if (!member) return;

            switch (punishment.action) {
                case 'mute_24h':
                    await this.muteUser(member, 24 * 60 * 60 * 1000, `Auto-mod: Hate speech violation (${violationCount}/2)`);
                    break;

                case 'ban':
                    await this.banUser(member, `Auto-mod: Repeated hate speech violations (${violationCount}/2)`);
                    break;
            }

            // Log the moderation action
            await this.dbManager.logModerationAction(
                message.guild.id,
                this.client.user.id,
                this.client.user.username,
                member.id,
                member.user.username,
                punishment.action.includes('mute') ? 'timeout' : punishment.action,
                `Auto-moderation: Hate speech violation (Strike ${violationCount}/2)`,
                message.channel.id,
                message.channel.name
            );

        } catch (error) {
            console.error('Error executing hate speech punishment:', error);
        }
    }

    async handleInviteSpam(message) {
        try {
            // Delete the message immediately
            await message.delete();

            // Get user's violation history
            const violations = await this.dbManager.getAutoModViolations(
                message.guild.id, 
                message.author.id, 
                'invite_spam'
            );

            const violationCount = violations.length + 1; // +1 for current violation

            // Log the violation
            await this.dbManager.logAutoModViolation(
                message.guild.id,
                message.author.id,
                message.author.username,
                'invite_spam',
                message.content,
                message.channel.id
            );

            // Determine punishment based on violation count
            const punishment = this.getEscalatedPunishment(violationCount);
            
            // Create public warning embed
            const warningEmbed = new EmbedBuilder()
                .setTitle('🚫 Auto-Moderation: Discord Invite Detected')
                .setDescription(`**${message.author.toString()}** posted a Discord invite link!`)
                .addFields(
                    { name: '⚠️ Violation', value: `Discord invite links are not allowed`, inline: false },
                    { name: '📊 Strike Count', value: `${violationCount}/5`, inline: true },
                    { name: '⚡ Action Taken', value: punishment.description, inline: true },
                    { name: '📝 Next Punishment', value: punishment.next || 'Ban', inline: true }
                )
                .setColor(0xff4444)
                .setFooter({ text: 'GuardianBot Auto-Moderation | Repeated violations result in escalated punishments' })
                .setTimestamp();

            // Send public warning
            const warningMessage = await message.channel.send({ embeds: [warningEmbed] });

            // Execute the punishment
            await this.executePunishment(message, punishment, violationCount);

            // Create log embed for staff channel
            const logEmbed = new EmbedBuilder()
                .setTitle('🚫 AUTO-MOD: Discord Invite Spam')
                .setDescription(`**User:** ${message.author.toString()} (${message.author.tag})\n**Channel:** ${message.channel.toString()}`)
                .addFields(
                    { name: '🔗 Detected Invite', value: `\`\`\`${message.content.substring(0, 1000)}\`\`\``, inline: false },
                    { name: '📊 Strike Count', value: `${violationCount}/5`, inline: true },
                    { name: '⚡ Action Taken', value: punishment.description, inline: true },
                    { name: '🕐 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setColor(0xff4444)
                .setFooter({ text: 'GuardianBot Auto-Moderation System' })
                .setTimestamp();

            // Send to staff log channel
            await this.sendToLogChannel(message.guild, logEmbed);

            // Auto-delete warning after 10 seconds to keep chat clean
            setTimeout(async () => {
                try {
                    await warningMessage.delete();
                } catch (error) {
                    // Message might already be deleted
                }
            }, 10000);

            return { deleted: true, punishment: punishment.action, violationCount };
        } catch (error) {
            console.error('Error handling invite spam:', error);
            return { deleted: false, reason: 'error' };
        }
    }

    getEscalatedPunishment(violationCount) {
        const punishments = {
            1: { 
                action: 'warn', 
                description: '⚠️ **Warning** - First violation', 
                next: 'Temporary mute (5 minutes)' 
            },
            2: { 
                action: 'mute_5m', 
                description: '🔇 **5 minute mute** - Second violation', 
                next: 'Extended mute (30 minutes)' 
            },
            3: { 
                action: 'mute_30m', 
                description: '🔇 **30 minute mute** - Third violation', 
                next: 'Long mute (2 hours)' 
            },
            4: { 
                action: 'mute_2h', 
                description: '🔇 **2 hour mute** - Fourth violation', 
                next: 'Permanent ban' 
            },
            5: { 
                action: 'ban', 
                description: '🔨 **Permanent ban** - Fifth violation', 
                next: null 
            }
        };

        return punishments[violationCount] || punishments[5]; // Default to ban for 5+ violations
    }

    async executePunishment(message, punishment, violationCount) {
        try {
            const member = message.member;
            if (!member) return;

            switch (punishment.action) {
                case 'warn':
                    // Warning is already handled by the public message
                    break;

                case 'mute_5m':
                    await this.muteUser(member, 5 * 60 * 1000, `Auto-mod: Discord invite spam (${violationCount}/5)`);
                    break;

                case 'mute_30m':
                    await this.muteUser(member, 30 * 60 * 1000, `Auto-mod: Discord invite spam (${violationCount}/5)`);
                    break;

                case 'mute_2h':
                    await this.muteUser(member, 2 * 60 * 60 * 1000, `Auto-mod: Discord invite spam (${violationCount}/5)`);
                    break;

                case 'ban':
                    await this.banUser(member, `Auto-mod: Excessive Discord invite spam (${violationCount}/5)`);
                    break;
            }

            // Log the moderation action
            await this.dbManager.logModerationAction(
                message.guild.id,
                this.client.user.id,
                this.client.user.username,
                member.id,
                member.user.username,
                punishment.action.includes('mute') ? 'timeout' : punishment.action,
                `Auto-moderation: Discord invite spam (Strike ${violationCount}/5)`,
                message.channel.id,
                message.channel.name
            );

        } catch (error) {
            console.error('Error executing punishment:', error);
        }
    }

    async muteUser(member, duration, reason) {
        try {
            await member.timeout(duration, reason);
            
            // Send DM to user
            try {
                const durationText = this.formatDuration(duration);
                await member.user.send(
                    `🔇 **You have been muted in ${member.guild.name}**\n\n` +
                    `**Reason:** ${reason}\n` +
                    `**Duration:** ${durationText}\n\n` +
                    `Please follow the server rules to avoid further punishment.`
                );
            } catch (dmError) {
                // User has DMs disabled
            }
        } catch (error) {
            console.error('Error muting user:', error);
        }
    }

    async banUser(member, reason) {
        try {
            // Send DM before ban
            try {
                await member.user.send(
                    `🔨 **You have been banned from ${member.guild.name}**\n\n` +
                    `**Reason:** ${reason}\n\n` +
                    `This action was taken automatically due to repeated rule violations.`
                );
            } catch (dmError) {
                // User has DMs disabled
            }

            await member.ban({ reason, deleteMessageDays: 1 });
        } catch (error) {
            console.error('Error banning user:', error);
        }
    }

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
        if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    // Utility Methods
    hasPermission(member) {
        if (!member) return false;
        return member.permissions.has(PermissionFlagsBits.ManageGuild) ||
               member.permissions.has(PermissionFlagsBits.Administrator) ||
               config.adminRoleIds?.some(roleId => member.roles.cache.has(roleId)) ||
               false;
    }

    getStaffType(member) {
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            return 'Administrator';
        } else if (member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return 'Moderator';
        } else if (config.adminRoleIds?.some(roleId => member.roles.cache.has(roleId))) {
            return 'Staff Member';
        }
        return 'Member';
    }

    canModerateTarget(moderator, target) {
        if (!moderator || !target) return false;
        
        // Owners can moderate anyone
        if (config.ownerIds.includes(moderator.id)) return true;
        
        // Can't moderate protected users (except owners)
        if (config.protectedUsers && config.protectedUsers.includes(target.id)) {
            return config.ownerIds.includes(moderator.id);
        }
        
        // Must have basic permissions
        if (!this.hasPermission(moderator)) return false;
        
        // Administrators can moderate anyone below admin level
        if (moderator.permissions.has(PermissionFlagsBits.Administrator)) {
            return !target.permissions.has(PermissionFlagsBits.Administrator) || moderator.roles.highest.position > target.roles.highest.position;
        }
        
        // Role hierarchy check - moderator must have higher role position
        return moderator.roles.highest.position > target.roles.highest.position;
    }

    async lockdownServer(guild, reason = 'Server lockdown activated') {
        const trumpResponse = this.getTrumpResponse('lockdown');
        
        try {
            // Remove @everyone send message permissions from all text channels
            for (const [, channel] of guild.channels.cache) {
                if (channel.type === ChannelType.GuildText) {
                    await channel.permissionOverwrites.edit(guild.id, {
                        SendMessages: false
                    });
                    console.log(`Removed @everyone overwrites from: ${channel.name}`);
                }
            }

            const lockdownEmbed = new EmbedBuilder()
                .setTitle('🔒 SERVER LOCKDOWN ACTIVATED')
                .setDescription(`**${trumpResponse}**`)
                .setColor(0xff0000)
                .addFields(
                    { name: '📋 Reason', value: reason, inline: true },
                    { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '🎯 TRUMP SAYS', value: 'We\'re locking this place down TIGHT!', inline: false }
                )
                .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                .setTimestamp();

            await this.sendToLogChannel(guild, lockdownEmbed);
        } catch (error) {
            console.error('Error during server lockdown:', error);
        }
    }

    async lockdownChannel(channel, reason = 'Channel lockdown activated', lockedBy) {
        const trumpResponse = this.getTrumpResponse('lockdown');
        
        try {
            // Remove @everyone send message permissions from the specific channel
            await channel.permissionOverwrites.edit(channel.guild.id, {
                SendMessages: false
            });

            const lockdownEmbed = new EmbedBuilder()
                .setTitle('🔒 CHANNEL LOCKDOWN ACTIVATED')
                .setDescription(`**${trumpResponse}**`)
                .setColor(0xff0000)
                .addFields(
                    { name: '📺 Channel', value: `#${channel.name}`, inline: true },
                    { name: '👨‍💼 Locked By', value: lockedBy.tag, inline: true },
                    { name: '📋 Reason', value: reason, inline: true },
                    { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '🎯 TRUMP SAYS', value: 'This channel is on LOCKDOWN!', inline: false }
                )
                .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                .setTimestamp();

            await this.sendToLogChannel(channel.guild, lockdownEmbed);
            
            // Send lockdown message to the channel itself
            const channelLockdownEmbed = new EmbedBuilder()
                .setTitle('🔒 CHANNEL LOCKED')
                .setDescription(`**This channel has been locked down by staff.**\n\n${reason}`)
                .setColor(0xff0000)
                .addFields(
                    { name: '👨‍💼 Locked By', value: lockedBy.toString(), inline: true },
                    { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true }
                )
                .setTimestamp();

            await channel.send({ embeds: [channelLockdownEmbed] });
        } catch (error) {
            console.error('Error during channel lockdown:', error);
        }
    }

    async unlockServer(guild, reason = 'Server lockdown removed') {
        const trumpResponse = this.getTrumpResponse('unlock');
        
        try {
            // Restore @everyone send message permissions
            for (const [, channel] of guild.channels.cache) {
                if (channel.type === ChannelType.GuildText) {
                    await channel.permissionOverwrites.edit(guild.id, {
                        SendMessages: null // Reset to default
                    });
                }
            }

            const unlockEmbed = new EmbedBuilder()
                .setTitle('🔓 SERVER UNLOCKED')
                .setDescription(`**${trumpResponse}**`)
                .setColor(0x00ff00)
                .addFields(
                    { name: '📋 Reason', value: reason, inline: true },
                    { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '🎯 TRUMP SAYS', value: 'We\'re open for business again!', inline: false }
                )
                .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                .setTimestamp();

            await this.sendToLogChannel(guild, unlockEmbed);
        } catch (error) {
            console.error('Error during server unlock:', error);
        }
    }

    async unlockChannel(channel, reason = 'Channel lockdown removed', unlockedBy) {
        const trumpResponse = this.getTrumpResponse('unlock');
        
        try {
            // Restore @everyone send message permissions for the specific channel
            await channel.permissionOverwrites.edit(channel.guild.id, {
                SendMessages: null // Reset to default
            });

            const unlockEmbed = new EmbedBuilder()
                .setTitle('🔓 CHANNEL UNLOCKED')
                .setDescription(`**${trumpResponse}**`)
                .setColor(0x00ff00)
                .addFields(
                    { name: '📺 Channel', value: `#${channel.name}`, inline: true },
                    { name: '👨‍💼 Unlocked By', value: unlockedBy.tag, inline: true },
                    { name: '📋 Reason', value: reason, inline: true },
                    { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '🎯 TRUMP SAYS', value: 'This channel is open for business!', inline: false }
                )
                .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                .setTimestamp();

            await this.sendToLogChannel(channel.guild, unlockEmbed);
            
            // Send unlock message to the channel itself
            const channelUnlockEmbed = new EmbedBuilder()
                .setTitle('🔓 CHANNEL UNLOCKED')
                .setDescription(`**This channel has been unlocked by staff.**\n\n${reason}`)
                .setColor(0x00ff00)
                .addFields(
                    { name: '👨‍💼 Unlocked By', value: unlockedBy.toString(), inline: true },
                    { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true }
                )
                .setTimestamp();

            await channel.send({ embeds: [channelUnlockEmbed] });
        } catch (error) {
            console.error('Error during channel unlock:', error);
        }
    }

    // Message Command Handler
    async handleSlashCommand(interaction) {
        try {
            if (!interaction.isCommand()) return;
            
            const { commandName, options } = interaction;
            
            switch (commandName) {
                case 'ping':
                    const ping = this.client.ws.ping;
                    const trumpResponse = this.getTrumpResponse('generalResponses', { ping: ping });
                    
                    const pingEmbed = new EmbedBuilder()
                        .setTitle('🏓 PONG!')
                        .setDescription(`**${trumpResponse}**`)
                        .addFields(
                            { name: '⚡ Bot Latency', value: `${ping}ms`, inline: true },
                            { name: '🌐 API Latency', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true }
                        )
                        .setColor(0x00ff00)
                        .setTimestamp()
                        .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' });
                    
                    await interaction.reply({ embeds: [pingEmbed] });
                    break;

                case 'status':
                    const uptime = process.uptime();
                    const days = Math.floor(uptime / 86400);
                    const hours = Math.floor((uptime % 86400) / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const seconds = Math.floor(uptime % 60);
                    
                    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                    const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
                    const botLatency = this.client.ws.ping;
                    const guildCount = this.client.guilds.cache.size;
                    const userCount = this.client.users.cache.size;
                    
                    // Get database connection status
                    let dbStatus = '❌ Disconnected';
                    try {
                        await this.db.query('SELECT 1');
                        dbStatus = '✅ Connected';
                    } catch (error) {
                        dbStatus = '⚠️ Error';
                    }
                    
                    const statusEmbed = new EmbedBuilder()
                        .setTitle('🤖 GuardianBot Status Report')
                        .setDescription('**Comprehensive bot system information**')
                        .addFields(
                            { name: '⏱️ Uptime', value: uptimeString, inline: true },
                            { name: '🏓 Latency', value: `${botLatency}ms`, inline: true },
                            { name: '💾 Memory', value: `${memoryUsage}MB`, inline: true },
                            { name: '🏠 Servers', value: guildCount.toString(), inline: true },
                            { name: '👥 Users', value: userCount.toString(), inline: true },
                            { name: '🗃️ Database', value: dbStatus, inline: true },
                            { name: '🔧 Node.js', value: process.version, inline: true },
                            { name: '⚙️ Status', value: '🟢 Online & Operational', inline: true },
                            { name: '🛡️ Features', value: 'Moderation + Security + AI', inline: true }
                        )
                        .setColor(0x00ff00)
                        .setTimestamp()
                        .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' });
                    
                    await interaction.reply({ embeds: [statusEmbed] });
                    break;

                case 'kick':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to kick members!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const kickTarget = options.getUser('user');
                    const kickReason = options.getString('reason') || 'No reason provided';
                    
                    // Check for protected users and auto-punish violators
                    if (config.protectedUsers && config.protectedUsers.includes(kickTarget.id)) {
                        // Auto-remove all roles from the person trying to kick protected users
                        try {
                            const violator = interaction.member;
                            const rolesToRemove = violator.roles.cache.filter(role => role.name !== '@everyone');
                            
                            if (rolesToRemove.size > 0) {
                                await violator.roles.remove(rolesToRemove, `Auto-punishment: Attempted to kick protected user ${kickTarget.tag}`);
                                
                                const punishmentEmbed = new EmbedBuilder()
                                    .setTitle('⚠️ PROTECTION VIOLATION')
                                    .setDescription(`**${violator.user.tag}** tried to kick protected user **${kickTarget.tag}** and has been stripped of all roles!`)
                                    .setColor(0xff0000)
                                    .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                                    .setTimestamp();
                                
                                // Log the violation
                                await this.logEvent(interaction.guild, 'Protection Violation', 
                                    `${violator.user.tag} attempted to kick protected user ${kickTarget.tag} - all roles removed`, 0xff0000);
                                
                                // Notify the channel
                                await interaction.reply({ embeds: [punishmentEmbed] });
                                
                                return;
                            }
                        } catch (error) {
                            console.error('Failed to remove roles from violator:', error);
                        }
                        
                        return interaction.reply({ content: '❌ This user is protected and cannot be kicked!', flags: MessageFlags.Ephemeral });
                    }
                    
                    try {
                        const member = await interaction.guild.members.fetch(kickTarget.id);
                        
                        // Check if user can moderate the target
                        if (!this.canModerateTarget(interaction.member, member)) {
                            return interaction.reply({ content: '❌ You cannot kick this user! They have equal or higher role permissions than you.', flags: MessageFlags.Ephemeral });
                        }
                        
                        await member.kick(kickReason);
                        
                        const trumpResponse = this.getTrumpResponse('punishment', { user: kickTarget.tag });
                        
                        const kickEmbed = new EmbedBuilder()
                            .setTitle('👢 USER KICKED')
                            .setDescription(`**${trumpResponse}**`)
                            .addFields(
                                { name: '👤 User', value: kickTarget.tag, inline: true },
                                { name: '📋 Reason', value: kickReason, inline: true },
                                { name: '👨‍💼 Kicked By', value: interaction.user.tag, inline: true }
                            )
                            .setColor(0xff9900)
                            .setTimestamp()
                            .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' });
                        
                        await interaction.reply({ embeds: [kickEmbed] });
                        await this.logEvent(interaction.guild, 'User Kicked', `${kickTarget.tag} was kicked by ${interaction.user.tag} - Reason: ${kickReason}`, 0xff9900);
                        
                        // Log kick to database
                        if (this.dbManager && this.dbManager.isConnected) {
                            await this.dbManager.logModeration(
                                interaction.guild.id,
                                'kick',
                                interaction.user.id,
                                interaction.user.tag,
                                kickTarget.id,
                                kickTarget.tag,
                                kickReason
                            );
                        }
                    } catch (error) {
                        console.error('Kick command error:', error);
                        if (error.code === 10007) {
                            await interaction.reply({ content: '❌ User not found in this server!', flags: MessageFlags.Ephemeral });
                        } else {
                            await interaction.reply({ content: `❌ Failed to kick user! Error: ${error.message}`, flags: MessageFlags.Ephemeral });
                        }
                    }
                    break;

                case 'ban':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to ban members!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const banTarget = options.getUser('user');
                    const banReason = options.getString('reason') || 'No reason provided';
                    
                    // Check for protected users and auto-punish violators
                    if (config.protectedUsers && config.protectedUsers.includes(banTarget.id)) {
                        // Auto-remove all roles from the person trying to ban protected users
                        try {
                            const violator = interaction.member;
                            const rolesToRemove = violator.roles.cache.filter(role => role.name !== '@everyone');
                            
                            if (rolesToRemove.size > 0) {
                                await violator.roles.remove(rolesToRemove, `Auto-punishment: Attempted to ban protected user ${banTarget.tag}`);
                                
                                const punishmentEmbed = new EmbedBuilder()
                                    .setTitle('⚠️ PROTECTION VIOLATION')
                                    .setDescription(`**${violator.user.tag}** tried to ban protected user **${banTarget.tag}** and has been stripped of all roles!`)
                                    .setColor(0xff0000)
                                    .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                                    .setTimestamp();
                                
                                // Log the violation
                                await this.logEvent(interaction.guild, 'Protection Violation', 
                                    `${violator.user.tag} attempted to ban protected user ${banTarget.tag} - all roles removed`, 0xff0000);
                                
                                // Notify the channel
                                await interaction.reply({ embeds: [punishmentEmbed] });
                                
                                return;
                            }
                        } catch (error) {
                            console.error('Failed to remove roles from violator:', error);
                        }
                        
                        return interaction.reply({ content: '❌ This user is protected and cannot be banned!', flags: MessageFlags.Ephemeral });
                    }
                    
                    try {
                        // Check if user can moderate the target (if they're in the server)
                        let targetMember = null;
                        try {
                            targetMember = await interaction.guild.members.fetch(banTarget.id);
                            if (targetMember && !this.canModerateTarget(interaction.member, targetMember)) {
                                return interaction.reply({ content: '❌ You cannot ban this user! They have equal or higher role permissions than you.', flags: MessageFlags.Ephemeral });
                            }
                        } catch (error) {
                            // User not in server, can still ban by ID
                        }
                        
                        // Ban the user (works for both members in server and users not in server)
                        await interaction.guild.bans.create(banTarget.id, { reason: banReason });
                        
                        const trumpResponse = this.getTrumpResponse('punishment', { user: banTarget.tag });
                        
                        const banEmbed = new EmbedBuilder()
                            .setTitle('🔨 USER BANNED')
                            .setDescription(`**${trumpResponse}**`)
                            .addFields(
                                { name: '👤 User', value: banTarget.tag, inline: true },
                                { name: '📋 Reason', value: banReason, inline: true },
                                { name: '👨‍💼 Banned By', value: interaction.user.tag, inline: true },
                                { name: '🏠 In Server', value: targetMember ? 'Yes' : 'No', inline: true }
                            )
                            .setColor(0xff0000)
                            .setTimestamp()
                            .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' });
                        
                        await interaction.reply({ embeds: [banEmbed] });
                        await this.logEvent(interaction.guild, 'User Banned', `${banTarget.tag} was banned by ${interaction.user.tag} - Reason: ${banReason}`, 0xff0000);
                        
                        // Log to database
                        if (this.dbManager && this.dbManager.isConnected) {
                            await this.dbManager.logModeration(
                                interaction.guild.id,
                                'ban',
                                interaction.user.id,
                                interaction.user.tag,
                                banTarget.id,
                                banTarget.tag,
                                banReason
                            );
                        }
                    } catch (error) {
                        console.error('Ban command error:', error);
                        await interaction.reply({ content: `❌ Failed to ban user! Error: ${error.message}`, flags: MessageFlags.Ephemeral });
                    }
                    break;

                case 'warn':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to warn members!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const warnTarget = options.getUser('user');
                    const warnReason = options.getString('reason');
                    
                    // Check if user can moderate the target
                    try {
                        const targetMember = await interaction.guild.members.fetch(warnTarget.id);
                        if (!this.canModerateTarget(interaction.member, targetMember)) {
                            return interaction.reply({ content: '❌ You cannot warn this user! They have equal or higher role permissions than you.', flags: MessageFlags.Ephemeral });
                        }
                    } catch (error) {
                        return interaction.reply({ content: '❌ Could not find the target user in this server!', flags: MessageFlags.Ephemeral });
                    }
                    
                    if (config.protectedUsers && config.protectedUsers.includes(warnTarget.id)) {
                        return interaction.reply({ content: '❌ This user is protected and cannot be warned!', flags: MessageFlags.Ephemeral });
                    }
                    
                    // Get or create warning array for this user
                    if (!this.warningTracker.has(warnTarget.id)) {
                        this.warningTracker.set(warnTarget.id, []);
                    }
                    
                    const warning = {
                        id: Date.now(), // Simple ID using timestamp
                        reason: warnReason,
                        issuedBy: interaction.user.id,
                        issuedByTag: interaction.user.tag,
                        timestamp: Date.now(),
                        guildId: interaction.guild.id
                    };
                    
                    this.warningTracker.get(warnTarget.id).push(warning);
                    const totalWarnings = this.warningTracker.get(warnTarget.id).length;
                    
                    const warnTrumpResponse = this.getTrumpResponse('punishment', { user: warnTarget.tag });
                    
                    const warnEmbed = new EmbedBuilder()
                        .setTitle('⚠️ USER WARNED')
                        .setDescription(`**${warnTrumpResponse}**`)
                        .addFields(
                            { name: '👤 User', value: warnTarget.tag, inline: true },
                            { name: '📋 Reason', value: warnReason, inline: true },
                            { name: '👨‍💼 Warned By', value: interaction.user.tag, inline: true },
                            { name: '📊 Total Warnings', value: totalWarnings.toString(), inline: true },
                            { name: '🕐 Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setColor(0xffaa00)
                        .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [warnEmbed] });
                    await this.sendToLogChannel(interaction.guild, warnEmbed);
                    
                    // Log warning to database
                    if (this.dbManager && this.dbManager.isConnected) {
                        await this.dbManager.logModeration(
                            interaction.guild.id,
                            'warn',
                            interaction.user.id,
                            interaction.user.tag,
                            warnTarget.id,
                            warnTarget.tag,
                            warnReason,
                            { warning_count: totalWarnings }
                        );
                    }
                    
                    // Auto-mute after 5 warnings
                    if (totalWarnings >= 5) {
                        try {
                            const member = await interaction.guild.members.fetch(warnTarget.id);
                            const muteTimeMs = 5 * 60 * 1000; // 5 minutes in milliseconds
                            const muteEndTime = new Date(Date.now() + muteTimeMs);
                            
                            await member.timeout(muteTimeMs, `Auto-mute: Reached 5 warnings`);
                            
                            const autoMuteTrumpResponse = this.getTrumpResponse('punishment', { user: warnTarget.tag });
                            
                            const autoMuteEmbed = new EmbedBuilder()
                                .setTitle('🔇 AUTO-MUTE ACTIVATED')
                                .setDescription(`**${autoMuteTrumpResponse}**`)
                                .addFields(
                                    { name: '👤 User', value: warnTarget.tag, inline: true },
                                    { name: '📊 Warning Count', value: `${totalWarnings} warnings`, inline: true },
                                    { name: '⏰ Mute Duration', value: '5 minutes', inline: true },
                                    { name: '🔓 Unmute Time', value: `<t:${Math.floor(muteEndTime.getTime() / 1000)}:F>`, inline: false },
                                    { name: '📋 Reason', value: 'Automatic mute for reaching 5 warnings', inline: false }
                                )
                                .setColor(0xff0000)
                                .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                                .setTimestamp();
                            
                            await interaction.followUp({ embeds: [autoMuteEmbed] });
                            await this.logEvent(interaction.guild, 'User Auto-Muted', `${warnTarget.tag} was automatically muted for 5 minutes (5 warnings reached)`, 0xff0000);
                            
                        } catch (error) {
                            console.error('Failed to auto-mute user:', error);
                            await interaction.followUp({ content: `⚠️ Failed to auto-mute ${warnTarget.tag} despite reaching 5 warnings.`, flags: MessageFlags.Ephemeral });
                        }
                    }
                    
                    // Try to DM the user about their warning
                    try {
                        const dmEmbed = new EmbedBuilder()
                            .setTitle('⚠️ Warning Received')
                            .setDescription(`You have been warned in **${interaction.guild.name}**`)
                            .addFields(
                                { name: '📋 Reason', value: warnReason, inline: false },
                                { name: '📊 Total Warnings', value: `${totalWarnings} warning(s)`, inline: true },
                                { name: '👨‍💼 Warned By', value: interaction.user.tag, inline: true }
                            )
                            .setColor(0xffaa00)
                            .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                            .setTimestamp();
                        
                        // Add auto-mute notice if applicable
                        if (totalWarnings >= 5) {
                            dmEmbed.addFields({
                                name: '🔇 AUTO-MUTE ACTIVATED',
                                value: '⚠️ You have been automatically muted for **5 minutes** due to reaching 5 warnings!',
                                inline: false
                            });
                            dmEmbed.setColor(0xff0000);
                        }
                        
                        await warnTarget.send({ embeds: [dmEmbed] });
                    } catch (error) {
                        // User has DMs disabled or bot can't DM them
                    }
                    break;

                case 'warnings':
                    // Check if a user was specified to view their warnings
                    const warningsTarget = options.getUser('user');
                    const targetUser = warningsTarget || interaction.user;
                    const targetMember = interaction.guild.members.cache.get(targetUser.id);
                    
                    // If checking someone else's warnings, need permissions
                    if (warningsTarget && !this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to view other users\' warnings!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const userWarnings = this.warningTracker.get(targetUser.id) || [];
                    const guildWarnings = userWarnings.filter(w => w.guildId === interaction.guild.id);
                    
                    if (guildWarnings.length === 0) {
                        const noWarningsEmbed = new EmbedBuilder()
                            .setTitle('📋 Warning History')
                            .setDescription(`**${targetUser.tag}** has no warnings in this server.`)
                            .setColor(0x00ff00)
                            .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                            .setTimestamp();
                        
                        return interaction.reply({ embeds: [noWarningsEmbed] });
                    }
                    
                    // Create warning list
                    const warningList = guildWarnings.slice(-10).map((warning, index) => {
                        const date = new Date(warning.timestamp).toLocaleDateString();
                        return `**${index + 1}.** ${warning.reason}\n*Warned by: ${warning.issuedByTag}* • *${date}*`;
                    }).join('\n\n');
                    
                    const warningsEmbed = new EmbedBuilder()
                        .setTitle('⚠️ Warning History')
                        .setDescription(`**User:** ${targetUser.tag}\n**Total Warnings:** ${guildWarnings.length}`)
                        .addFields({
                            name: '📋 Recent Warnings',
                            value: warningList.length > 1024 ? warningList.substring(0, 1020) + '...' : warningList,
                            inline: false
                        })
                        .setColor(0xffaa00)
                        .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                        .setTimestamp();
                    
                    if (guildWarnings.length > 10) {
                        warningsEmbed.addFields({
                            name: '📊 Note',
                            value: `Showing 10 most recent warnings out of ${guildWarnings.length} total.`,
                            inline: false
                        });
                    }
                    
                    await interaction.reply({ embeds: [warningsEmbed] });
                    break;

                case 'removewarn':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to remove warnings!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const removeTarget = options.getUser('user');
                    if (!removeTarget) {
                        return interaction.reply({ content: '❌ Please provide a user to remove warnings from!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const removeArg = options.getString('warning') || options.getString('number');
                    if (!removeArg) {
                        return interaction.reply({ content: '❌ Please specify which warning to remove! Use a number or "all".', flags: MessageFlags.Ephemeral });
                    }
                    
                    const removeUserWarnings = this.warningTracker.get(removeTarget.id) || [];
                    const removeGuildWarnings = removeUserWarnings.filter(w => w.guildId === interaction.guild.id);
                    
                    if (removeGuildWarnings.length === 0) {
                        return interaction.reply({ content: `❌ **${removeTarget.tag}** has no warnings in this server!`, flags: MessageFlags.Ephemeral });
                    }
                    
                    if (removeArg.toLowerCase() === 'all') {
                        // Remove all warnings for this guild
                        const newWarnings = removeUserWarnings.filter(w => w.guildId !== interaction.guild.id);
                        this.warningTracker.set(removeTarget.id, newWarnings);
                        
                        const removeAllEmbed = new EmbedBuilder()
                            .setTitle('🗑️ ALL WARNINGS REMOVED')
                            .setDescription(`All warnings removed for **${removeTarget.tag}**`)
                            .addFields(
                                { name: '👤 User', value: removeTarget.tag, inline: true },
                                { name: '🗑️ Warnings Removed', value: removeGuildWarnings.length.toString(), inline: true },
                                { name: '👨‍💼 Removed By', value: interaction.user.tag, inline: true }
                            )
                            .setColor(0x00ff00)
                            .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                            .setTimestamp();
                        
                        await interaction.reply({ embeds: [removeAllEmbed] });
                        await this.sendToLogChannel(interaction.guild, removeAllEmbed);
                    } else {
                        // Remove specific warning by number
                        const warningIndex = parseInt(removeArg) - 1;
                        if (isNaN(warningIndex) || warningIndex < 0 || warningIndex >= removeGuildWarnings.length) {
                            return interaction.reply({ content: `❌ Invalid warning number! **${removeTarget.tag}** has ${removeGuildWarnings.length} warning(s). Use a number between 1-${removeGuildWarnings.length} or "all".`, flags: MessageFlags.Ephemeral });
                        }
                        
                        const warningToRemove = removeGuildWarnings[warningIndex];
                        const allUserWarnings = this.warningTracker.get(removeTarget.id);
                        const warningIndexInAll = allUserWarnings.findIndex(w => w.id === warningToRemove.id);
                        
                        if (warningIndexInAll !== -1) {
                            allUserWarnings.splice(warningIndexInAll, 1);
                            this.warningTracker.set(removeTarget.id, allUserWarnings);
                        }
                        
                        const removeSingleEmbed = new EmbedBuilder()
                            .setTitle('🗑️ WARNING REMOVED')
                            .setDescription(`Warning #${warningIndex + 1} removed for **${removeTarget.tag}**`)
                            .addFields(
                                { name: '👤 User', value: removeTarget.tag, inline: true },
                                { name: '📋 Removed Warning', value: warningToRemove.reason, inline: false },
                                { name: '👨‍💼 Removed By', value: interaction.user.tag, inline: true },
                                { name: '📊 Remaining Warnings', value: (removeGuildWarnings.length - 1).toString(), inline: true }
                            )
                            .setColor(0x00ff00)
                            .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                            .setTimestamp();
                        
                        await interaction.reply({ embeds: [removeSingleEmbed] });
                        await this.sendToLogChannel(interaction.guild, removeSingleEmbed);
                    }
                    break;

                case 'mute':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to mute members!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const muteTarget = options.getUser('user');
                    const muteDuration = options.getInteger('duration') || 60; // Default 60 minutes
                    const muteReason = options.getString('reason') || 'No reason provided';
                    
                    // Validate duration
                    if (muteDuration < 1 || muteDuration > 1440) { // 1 minute to 24 hours
                        return interaction.reply({ content: '❌ Mute duration must be between 1 and 1440 minutes (24 hours)!', flags: MessageFlags.Ephemeral });
                    }
                    
                    // Check for protected users and auto-punish violators
                    if (config.protectedUsers && config.protectedUsers.includes(muteTarget.id)) {
                        // Auto-remove all roles from the person trying to mute protected users
                        try {
                            const violator = interaction.member;
                            const rolesToRemove = violator.roles.cache.filter(role => role.name !== '@everyone');
                            
                            if (rolesToRemove.size > 0) {
                                await violator.roles.remove(rolesToRemove, `Auto-punishment: Attempted to mute protected user ${muteTarget.tag}`);
                                
                                const punishmentEmbed = new EmbedBuilder()
                                    .setTitle('⚠️ PROTECTION VIOLATION')
                                    .setDescription(`**${violator.user.tag}** tried to mute protected user **${muteTarget.tag}** and has been stripped of all roles!`)
                                    .setColor(0xff0000)
                                    .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                                    .setTimestamp();
                                
                                // Log the violation
                                await this.logEvent(interaction.guild, 'Protection Violation', 
                                    `${violator.user.tag} attempted to mute protected user ${muteTarget.tag} - all roles removed`, 0xff0000);
                                
                                // Notify the channel
                                await interaction.reply({ embeds: [punishmentEmbed] });
                                
                                return;
                            }
                        } catch (error) {
                            console.error('Failed to remove roles from violator:', error);
                        }
                        
                        return interaction.reply({ content: '❌ This user is protected and cannot be muted!', flags: MessageFlags.Ephemeral });
                    }
                    
                    try {
                        const targetMember = await interaction.guild.members.fetch(muteTarget.id);
                        if (!this.canModerateTarget(interaction.member, targetMember)) {
                            return interaction.reply({ content: '❌ You cannot mute this user! They have equal or higher role permissions than you.', flags: MessageFlags.Ephemeral });
                        }
                        
                        // Check if user is already muted
                        if (targetMember.communicationDisabledUntil && targetMember.communicationDisabledUntil > new Date()) {
                            return interaction.reply({ content: `❌ **${muteTarget.tag}** is already muted! Mute expires: <t:${Math.floor(targetMember.communicationDisabledUntil.getTime() / 1000)}:R>`, flags: MessageFlags.Ephemeral });
                        }
                        
                        const muteTimeMs = muteDuration * 60 * 1000; // Convert minutes to milliseconds
                        const muteEndTime = new Date(Date.now() + muteTimeMs);
                        
                        // Apply the timeout
                        await targetMember.timeout(muteTimeMs, muteReason);
                        
                        const muteTrumpResponse = this.getTrumpResponse('punishment', { user: muteTarget.tag });
                        
                        const muteEmbed = new EmbedBuilder()
                            .setTitle('🔇 USER MUTED')
                            .setDescription(`**${muteTrumpResponse}**`)
                            .addFields(
                                { name: '👤 User', value: muteTarget.tag, inline: true },
                                { name: '⏰ Duration', value: `${muteDuration} minutes`, inline: true },
                                { name: '👨‍💼 Muted By', value: interaction.user.tag, inline: true },
                                { name: '📋 Reason', value: muteReason, inline: false },
                                { name: '🔓 Unmute Time', value: `<t:${Math.floor(muteEndTime.getTime() / 1000)}:F>`, inline: false }
                            )
                            .setColor(0xff6600)
                            .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                            .setTimestamp();
                        
                        await interaction.reply({ embeds: [muteEmbed] });
                        await this.logEvent(interaction.guild, 'User Muted', `${muteTarget.tag} was muted for ${muteDuration} minutes by ${interaction.user.tag} - Reason: ${muteReason}`, 0xff6600);
                        
                        // Log mute to database
                        if (this.dbManager && this.dbManager.isConnected) {
                            await this.dbManager.logModeration(
                                interaction.guild.id,
                                'mute',
                                interaction.user.id,
                                interaction.user.tag,
                                muteTarget.id,
                                muteTarget.tag,
                                muteReason,
                                { duration: muteDuration, end_time: muteEndTime }
                            );
                        }
                        
                        // Try to DM the muted user
                        try {
                            const muteDmEmbed = new EmbedBuilder()
                                .setTitle('🔇 You Have Been Muted')
                                .setDescription(`You have been muted in **${interaction.guild.name}**`)
                                .addFields(
                                    { name: '⏰ Duration', value: `${muteDuration} minutes`, inline: true },
                                    { name: '📋 Reason', value: muteReason, inline: false },
                                    { name: '🔓 Unmute Time', value: `<t:${Math.floor(muteEndTime.getTime() / 1000)}:F>`, inline: false }
                                )
                                .setColor(0xff6600)
                                .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' });
                            
                            await muteTarget.send({ embeds: [muteDmEmbed] });
                        } catch (error) {
                            // User has DMs disabled or blocked the bot
                        }
                        
                    } catch (error) {
                        console.error('Mute command error:', error);
                        if (error.code === 10007) {
                            await interaction.reply({ content: '❌ User not found in this server!', flags: MessageFlags.Ephemeral });
                        } else if (error.code === 50013) {
                            await interaction.reply({ content: '❌ I don\'t have permission to mute this user! Make sure I have the "Moderate Members" permission and my role is higher than the target user.', flags: MessageFlags.Ephemeral });
                        } else {
                            await interaction.reply({ content: `❌ Failed to mute user! Error: ${error.message}`, flags: MessageFlags.Ephemeral });
                        }
                    }
                    break;

                case 'unmute':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to unmute members!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const unmuteTarget = options.getUser('user');
                    const unmuteReason = options.getString('reason') || 'Manual unmute by staff';
                    
                    try {
                        const member = await interaction.guild.members.fetch(unmuteTarget.id);
                        
                        // Check if user can moderate the target
                        if (!this.canModerateTarget(interaction.member, member)) {
                            return interaction.reply({ content: '❌ You cannot unmute this user! They have equal or higher role permissions than you.', flags: MessageFlags.Ephemeral });
                        }
                        
                        // Check if user is actually muted
                        if (!member.communicationDisabledUntil || member.communicationDisabledUntil < new Date()) {
                            return interaction.reply({ content: `❌ **${unmuteTarget.tag}** is not currently muted!`, flags: MessageFlags.Ephemeral });
                        }
                        
                        await member.timeout(null, unmuteReason); // Remove timeout
                        
                        const unmuteTrumpResponse = this.getTrumpResponse('unlock', { user: unmuteTarget.tag });
                        
                        const unmuteEmbed = new EmbedBuilder()
                            .setTitle('🔊 USER UNMUTED')
                            .setDescription(`**${unmuteTrumpResponse}**`)
                            .addFields(
                                { name: '👤 User', value: unmuteTarget.tag, inline: true },
                                { name: '👨‍💼 Unmuted By', value: interaction.user.tag, inline: true },
                                { name: '📋 Reason', value: unmuteReason, inline: false }
                            )
                            .setColor(0x00ff00)
                            .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                            .setTimestamp();
                        
                        await interaction.reply({ embeds: [unmuteEmbed] });
                        await this.logEvent(interaction.guild, 'User Unmuted', `${unmuteTarget.tag} was unmuted by ${interaction.user.tag} - Reason: ${unmuteReason}`, 0x00ff00);
                        
                        // Try to DM the unmuted user
                        try {
                            const unmuteDmEmbed = new EmbedBuilder()
                                .setTitle('🔊 You Have Been Unmuted')
                                .setDescription(`Your mute has been removed in **${interaction.guild.name}**`)
                                .addFields(
                                    { name: '📋 Reason', value: unmuteReason, inline: false },
                                    { name: '👨‍💼 Unmuted By', value: interaction.user.tag, inline: true }
                                )
                                .setColor(0x00ff00)
                                .setFooter({ text: 'GuardianBot Security --- Professional Discord Protection' })
                                .setTimestamp();
                            
                            await unmuteTarget.send({ embeds: [unmuteDmEmbed] });
                        } catch (error) {
                            // User has DMs disabled
                        }
                        
                    } catch (error) {
                        await interaction.reply({ content: '❌ Failed to unmute user! They may not be muted or an error occurred.', flags: MessageFlags.Ephemeral });
                    }
                    break;

                case 'lockdown':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to lockdown!', flags: MessageFlags.Ephemeral });
                    }
                    
                    // Check if a channel was provided
                    const lockdownChannel = options.getChannel('channel');
                    const lockdownReason = options.getString('reason') || 'Manual lockdown by staff';
                    
                    if (lockdownChannel) {
                        // Lockdown specific channel
                        if (lockdownChannel.type !== 0) {
                            return interaction.reply({ content: '❌ You can only lockdown text channels!', flags: MessageFlags.Ephemeral });
                        }
                        
                        await this.lockdownChannel(lockdownChannel, lockdownReason, interaction.user);
                        await interaction.reply({ content: `🔒 Channel \`#${lockdownChannel.name}\` has been locked down!` });
                    } else {
                        // Lockdown entire server
                        await this.lockdownServer(interaction.guild, lockdownReason);
                        await interaction.reply({ content: '🔒 Server lockdown activated!' });
                    }
                    break;

                case 'unlock':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to unlock!', flags: MessageFlags.Ephemeral });
                    }
                    
                    // Check if a channel was provided
                    const unlockChannel = options.getChannel('channel');
                    const unlockReason = options.getString('reason') || 'Manual unlock by staff';
                    
                    if (unlockChannel) {
                        // Unlock specific channel
                        if (unlockChannel.type !== 0) {
                            return interaction.reply({ content: '❌ You can only unlock text channels!', flags: MessageFlags.Ephemeral });
                        }
                        
                        await this.unlockChannel(unlockChannel, unlockReason, interaction.user);
                        await interaction.reply({ content: `🔓 Channel \`#${unlockChannel.name}\` has been unlocked!` });
                    } else {
                        // Unlock entire server
                        await this.unlockServer(interaction.guild, unlockReason);
                        await interaction.reply({ content: '🔓 Server unlocked!' });
                    }
                    break;

                case 'raid':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to announce raids!', flags: MessageFlags.Ephemeral });
                    }
                    
                    // Create the raid announcement embed
                    const raidEmbed = new EmbedBuilder()
                        .setTitle('🚨 RAID ALERT 🚨')
                        .setDescription('**WE ARE CURRENTLY BEING RAIDED, GuardianBot STOPPED THE RAID IN 1MS RESPONSE TIME!**')
                        .setColor(0xff0000)
                        .addFields(
                            { name: '⚡ Response Time', value: '1ms', inline: true },
                            { name: '🛡️ Status', value: 'RAID STOPPED', inline: true },
                            { name: '🎯 TRUMP SAYS', value: 'Nobody raids better than us, believe me! We stopped it FAST!', inline: false }
                        )
                        .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                        .setTimestamp();

                    // Send to current channel
                    await interaction.channel.send({ embeds: [raidEmbed] });
                    
                    // Also log to the log channel
                    await this.sendToLogChannel(interaction.guild, raidEmbed);
                    
                    await interaction.reply({ content: '🚨 Raid alert sent!', flags: MessageFlags.Ephemeral });
                    break;

                case 'say':
                    // Owner-only command to speak through the bot
                    if (!config.ownerIds.includes(interaction.user.id)) {
                        return interaction.reply({ content: '❌ Only the bot owner can use this command!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const sayMessage = options.getString('message');
                    
                    // Send the message as the bot
                    await interaction.reply({ content: sayMessage });
                    break;

                case 'echo':
                    // Another owner-only command to send messages with embeds
                    if (!config.ownerIds.includes(interaction.user.id)) {
                        return interaction.reply({ content: '❌ Only the bot owner can use this command!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const echoMessage = options.getString('message');
                    
                    // Send as an embed with admin signature
                    const echoEmbed = new EmbedBuilder()
                        .setDescription(echoMessage)
                        .setColor(0x0099ff)
                        .setFooter({ text: 'Message from Server Admin via GuardianBot Security' })
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [echoEmbed] });
                    break;

                case 'dm':
                    // Owner-only command to DM users through the bot
                    if (!config.ownerIds.includes(interaction.user.id)) {
                        return interaction.reply({ content: '❌ Only the bot owner can use this command!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const dmTarget = options.getUser('user');
                    const dmMessage = options.getString('message');
                    
                    try {
                        const dmEmbed = new EmbedBuilder()
                            .setTitle('📩 Message from Server Admin')
                            .setDescription(dmMessage)
                            .setColor(0x0099ff)
                            .setFooter({ text: `From: ${interaction.guild.name} | GuardianBot Security` })
                            .setTimestamp();
                        
                        await dmTarget.send({ embeds: [dmEmbed] });
                        await interaction.reply({ content: `✅ DM sent to **${dmTarget.tag}** successfully!`, flags: MessageFlags.Ephemeral });
                        
                    } catch (error) {
                        await interaction.reply({ content: `❌ Could not send DM to **${dmTarget.tag}**. They may have DMs disabled.`, flags: MessageFlags.Ephemeral });
                    }
                    break;

                case 'serverinfo':
                    const guild = interaction.guild;
                    const serverInfoEmbed = new EmbedBuilder()
                        .setTitle(`📊 ${guild.name} Server Information`)
                        .setThumbnail(guild.iconURL())
                        .addFields(
                            { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                            { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
                            { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                            { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
                            { name: '📺 Channels', value: guild.channels.cache.size.toString(), inline: true },
                            { name: '🎌 Region', value: 'Auto', inline: true }
                        )
                        .setColor(0x0099ff)
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [serverInfoEmbed] });
                    break;

                case 'botinfo':
                    const botInfoEmbed = new EmbedBuilder()
                        .setTitle('🤖 Guardian Bot Information')
                        .setDescription('**Guardian Bot - Your Premium Discord Security Solution!**')
                        .setThumbnail(this.client.user.displayAvatarURL())
                        .addFields(
                            { name: '🛡️ Anti-Raid Protection', value: 'Detects and prevents mass joins', inline: true },
                            { name: '💥 Anti-Nuke System', value: 'Stops channel/role deletion spams', inline: true },
                            { name: '🤖 Smart Responses', value: 'Intelligent bot replies', inline: true },
                            { name: '👮‍♂️ Moderation Tools', value: 'Kick, ban, lockdown commands', inline: true },
                            { name: '🛡️ Owner Protection', value: 'Special protection for server owner', inline: true },
                            { name: '📊 Server Monitoring', value: 'Real-time activity tracking', inline: true },
                            { name: '⚡ Response Time', value: `${this.client.ws.ping}ms`, inline: true },
                            { name: '🌐 Servers', value: this.client.guilds.cache.size.toString(), inline: true },
                            { name: '👥 Users', value: this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toString(), inline: true }
                        )
                        .setColor(0x1e3a8a)
                        .setFooter({ text: 'GuardianBot -- Professional Discord Security' })
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [botInfoEmbed] });
                    break;

                case 'help':
                    const helpEmbed = new EmbedBuilder()
                        .setTitle('📚 GuardianBot Commands')
                        .setDescription('**Available Slash Commands for all users (excluding owner commands):**')
                        .addFields(
                            { name: '🏓 /ping', value: 'Check bot latency and status', inline: true },
                            { name: '👢 /kick @user [reason]', value: 'Kick a user from the server', inline: true },
                            { name: '🔨 /ban @user [reason]', value: 'Ban a user from the server', inline: true },
                            { name: '⚠️ /warn @user <reason>', value: 'Warn a user and track warnings', inline: true },
                            { name: '📋 /warnings [@user]', value: 'View warnings (yours or another user)', inline: true },
                            { name: '🗑️ /removewarn @user <#|all>', value: 'Remove specific warning or all warnings', inline: true },
                            { name: '🔇 /mute @user [duration] [reason]', value: 'Mute user (duration in minutes, default: 60)', inline: true },
                            { name: '🔊 /unmute @user [reason]', value: 'Remove timeout/mute from a user', inline: true },
                            { name: '🔒 /lockdown [channel] [reason]', value: 'Lock server or specific channel', inline: true },
                            { name: '🔓 /unlock [channel] [reason]', value: 'Unlock server or specific channel', inline: true },
                            { name: '🚨 /raid', value: 'Announce raid alert with dramatic response', inline: true },
                            { name: '📊 /serverinfo', value: 'Get server information and statistics', inline: true },
                            { name: '🤖 /botinfo', value: 'Get bot information and statistics', inline: true },
                            { name: '� /staffstats [user] [days]', value: 'View staff activity statistics and leaderboard', inline: true },
                            { name: '�📚 /help', value: 'Show this help message', inline: true }
                        );
                    
                    helpEmbed.addFields(
                        { name: '📝 **USAGE EXAMPLES**', value: '`/warn @user Spamming in chat`\n`/warnings @user` - Check warnings\n`/mute @user 30 Inappropriate behavior`\n`/lockdown general Suspicious activity`\n`/removewarn @user all` - Clear all warnings\n`/staffstats @moderator 7` - Check staff activity\n`/dashboard` - Access admin panel', inline: false }
                        )
                        .setColor(0x0099ff)
                        .setFooter({ text: 'GuardianBot Security System | Professional Discord Protection | Use commands responsibly' })
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [helpEmbed] });
                    break;

                case 'staffstats':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to view staff statistics!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const statsTargetUser = options.getUser('user');
                    const daysPeriod = options.getInteger('days') || 7;
                    
                    try {
                        if (statsTargetUser) {
                            // Show specific user stats
                            const userStats = await this.dbManager.getStaffActivityReport(interaction.guild.id, daysPeriod);
                            const userActivity = userStats.find(stat => stat.user_id === statsTargetUser.id);
                            
                            if (!userActivity) {
                                return interaction.reply({ 
                                    content: `❌ No staff activity data found for **${statsTargetUser.tag}** in the last ${daysPeriod} days.`, 
                                    flags: MessageFlags.Ephemeral 
                                });
                            }
                            
                            const statsEmbed = new EmbedBuilder()
                                .setTitle(`📈 Staff Activity - ${statsTargetUser.tag}`)
                                .setDescription(`Activity report for the last **${daysPeriod} days**`)
                                .addFields(
                                    { name: '💬 Messages', value: `Daily: ${userActivity.daily_messages}\nWeekly: ${userActivity.weekly_messages}\nTotal: ${userActivity.recent_messages}`, inline: true },
                                    { name: '⚡ Commands', value: `Daily: ${userActivity.daily_commands}\nWeekly: ${userActivity.weekly_commands}\nTotal: ${userActivity.recent_commands}`, inline: true },
                                    { name: '🛡️ Moderation', value: `Recent: ${userActivity.recent_moderations}`, inline: true },
                                    { name: '📊 Activity Score', value: userActivity.activity_score.toString(), inline: true },
                                    { name: '⭐ Rating', value: userActivity.responsiveness_rating.charAt(0).toUpperCase() + userActivity.responsiveness_rating.slice(1), inline: true },
                                    { name: '🕐 Last Active', value: userActivity.last_message ? `<t:${Math.floor(new Date(userActivity.last_message).getTime() / 1000)}:R>` : 'Never', inline: true }
                                )
                                .setColor(0x00ff00)
                                .setThumbnail(statsTargetUser.displayAvatarURL())
                                .setFooter({ text: 'GuardianBot Staff Analytics | Activity tracking active' })
                                .setTimestamp();
                                
                            await interaction.reply({ embeds: [statsEmbed] });
                        } else {
                            // Show leaderboard
                            const leaderboard = await this.dbManager.getStaffActivityReport(interaction.guild.id, daysPeriod);
                            
                            if (leaderboard.length === 0) {
                                return interaction.reply({ 
                                    content: `❌ No staff activity data found for the last ${daysPeriod} days.`, 
                                    flags: MessageFlags.Ephemeral 
                                });
                            }
                            
                            const leaderboardText = leaderboard
                                .slice(0, 10)
                                .map((staff, index) => {
                                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                                    return `${medal} **${staff.username}** - Score: ${staff.activity_score} (${staff.responsiveness_rating})`;
                                })
                                .join('\n');
                            
                            const leaderboardEmbed = new EmbedBuilder()
                                .setTitle('📈 Staff Activity Leaderboard')
                                .setDescription(`**Top active staff members (Last ${daysPeriod} days)**\n\n${leaderboardText}`)
                                .addFields(
                                    { name: '📊 Activity Metrics', value: 'Messages: +1 pt\nCommands: +2 pts\nVoice Time: +0.5 pts', inline: true },
                                    { name: '⭐ Rating Scale', value: 'Excellent: 50+ pts\nGood: 30+ pts\nAverage: 15+ pts\nPoor: 5+ pts', inline: true }
                                )
                                .setColor(0x0099ff)
                                .setFooter({ text: 'GuardianBot Staff Analytics | Use /staffstats @user for detailed stats' })
                                .setTimestamp();
                                
                            await interaction.reply({ embeds: [leaderboardEmbed] });
                        }
                    } catch (error) {
                        console.error('Error fetching staff stats:', error);
                        await interaction.reply({ 
                            content: '❌ An error occurred while fetching staff statistics!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    break;

                case 'dashboard':
                    // Check if user has admin permissions
                    if (!this.hasPermission(interaction.member)) {
                        // Get a random security response for unauthorized users
                        const securityResponses = [
                            "🚨 **UNAUTHORIZED ACCESS DETECTED!** 🚨\n\n**Security systems are now monitoring your activity...**\n\n*You don't have permission to access the admin dashboard.*",
                            "⚠️ **SECURITY BREACH ALERT** ⚠️\n\n**Advanced tracking systems have been activated...**\n\n*Nice try, but you're not authorized for admin access.*",
                            "🛡️ **PROTECTION PROTOCOL ACTIVATED** 🛡️\n\n**Your access attempt is being monitored...**\n\n*Admin dashboard access denied. You've been logged.*",
                            "🔍 **INTRUSION DETECTION ACTIVE** 🔍\n\n**Security team is investigating your attempt...**\n\n*Dashboard access restricted to authorized personnel only.*"
                        ];
                        
                        const randomResponse = securityResponses[Math.floor(Math.random() * securityResponses.length)];
                        
                        const unauthorizedEmbed = new EmbedBuilder()
                            .setTitle('🚫 ACCESS DENIED')
                            .setDescription(randomResponse)
                            .setColor(0xff0000)
                            .addFields(
                                { name: '🌐 Your IP', value: '`Being Traced...`', inline: true },
                                { name: '📍 Location', value: '`Triangulating...`', inline: true },
                                { name: '⚖️ Status', value: '`Under Investigation`', inline: true }
                            )
                            .setFooter({ text: 'GuardianBot Security --- Protection Active' })
                            .setTimestamp();
                        
                        return interaction.reply({ embeds: [unauthorizedEmbed], flags: MessageFlags.Ephemeral });
                    }
                    
                    // Generate admin access token (in a real scenario, this would be more secure)
                    const accessToken = Buffer.from(`${interaction.user.id}:${Date.now()}`).toString('base64');
                    const dashboardUrl = `${process.env.DOMAIN || 'http://localhost:3000'}?token=${accessToken}&admin=true&user=${encodeURIComponent(interaction.user.tag)}`;
                    
                    const adminDashboardEmbed = new EmbedBuilder()
                        .setTitle('🛡️ GuardianBot Admin Dashboard')
                        .setDescription('**Welcome to the secure admin portal!**\n\nClick the link below to access your personalized dashboard with full administrative privileges.')
                        .addFields(
                            { name: '🔗 Dashboard Access', value: `[**Launch Admin Dashboard**](${dashboardUrl})`, inline: false },
                            { name: '⚡ Features Available', value: '• Real-time server statistics\n• Staff activity monitoring\n• Moderation logs\n• Security analytics\n• System configuration', inline: false },
                            { name: '🛡️ Security Notice', value: '• Your session is encrypted\n• Activity is logged\n• Auto-expires in 24 hours', inline: false }
                        )
                        .setColor(0x00ff00)
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setFooter({ text: `GuardianBot Admin Portal | Authorized: ${interaction.user.tag}` })
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [adminDashboardEmbed], flags: MessageFlags.Ephemeral });
                    
                    // Log the dashboard access
                    try {
                        await this.dbManager.logStaffActivity(
                            interaction.guild.id,
                            interaction.user.id,
                            interaction.user.username,
                            'command',
                            interaction.channel?.id,
                            interaction.channel?.name,
                            {
                                commandName: 'dashboard',
                                accessType: 'admin',
                                timestamp: new Date().toISOString()
                            }
                        );
                    } catch (error) {
                        console.error('Error logging dashboard access:', error);
                    }
                    break;

                case 'rank':
                    const rankTargetUser = options.getUser('user') || interaction.user;
                    
                    try {
                        const userData = await this.dbManager.getUserLevel(interaction.guild.id, rankTargetUser.id);
                        
                        if (!userData) {
                            return interaction.reply({ 
                                content: `❌ **${rankTargetUser.tag}** hasn't sent any messages yet!`, 
                                flags: MessageFlags.Ephemeral 
                            });
                        }
                        
                        const currentXP = userData.xp;
                        const currentLevel = userData.level;
                        const nextLevelXP = this.dbManager.calculateXPForLevel(currentLevel + 1);
                        const currentLevelXP = currentLevel > 0 ? this.dbManager.calculateXPForLevel(currentLevel) : 0;
                        const xpProgress = currentXP - currentLevelXP;
                        const xpNeeded = nextLevelXP - currentLevelXP;
                        const progressPercent = Math.floor((xpProgress / xpNeeded) * 100);
                        
                        // Get user's rank position
                        const leaderboard = await this.dbManager.getLeaderboard(interaction.guild.id, 1000);
                        const userRank = leaderboard.findIndex(user => user.user_id === rankTargetUser.id) + 1;
                        
                        const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));
                        
                        const rankEmbed = new EmbedBuilder()
                            .setTitle(`📊 ${rankTargetUser.tag}'s Rank`)
                            .setThumbnail(rankTargetUser.displayAvatarURL())
                            .addFields(
                                { name: '🏆 Rank', value: `#${userRank} of ${leaderboard.length}`, inline: true },
                                { name: '📈 Level', value: currentLevel.toString(), inline: true },
                                { name: '💎 Total XP', value: currentXP.toString(), inline: true },
                                { name: '📊 Progress', value: `${progressBar} ${progressPercent}%\n${xpProgress}/${xpNeeded} XP to level ${currentLevel + 1}`, inline: false },
                                { name: '💬 Messages Sent', value: userData.messages_sent.toString(), inline: true }
                            )
                            .setColor(0x00ff00)
                            .setFooter({ text: 'GuardianBot XP System | Keep chatting to gain XP!' })
                            .setTimestamp();
                            
                        await interaction.reply({ embeds: [rankEmbed] });
                    } catch (error) {
                        console.error('Error fetching rank:', error);
                        await interaction.reply({ 
                            content: '❌ An error occurred while fetching rank data!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    break;

                case 'leaderboard':
                    const page = options.getInteger('page') || 1;
                    const usersPerPage = 10;
                    const offset = (page - 1) * usersPerPage;
                    
                    try {
                        const allUsers = await this.dbManager.getLeaderboard(interaction.guild.id, 100);
                        const totalPages = Math.ceil(allUsers.length / usersPerPage);
                        
                        if (page > totalPages) {
                            return interaction.reply({ 
                                content: `❌ Page ${page} doesn't exist! There are only ${totalPages} pages.`, 
                                flags: MessageFlags.Ephemeral 
                            });
                        }
                        
                        const pageUsers = allUsers.slice(offset, offset + usersPerPage);
                        
                        const leaderboardText = pageUsers
                            .map((user, index) => {
                                const rank = offset + index + 1;
                                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `**${rank}.**`;
                                return `${medal} ${user.username} - Level ${user.level} (${user.xp} XP)`;
                            })
                            .join('\n');
                        
                        const leaderboardEmbed = new EmbedBuilder()
                            .setTitle(`🏆 XP Leaderboard - ${interaction.guild.name}`)
                            .setDescription(leaderboardText || 'No users found!')
                            .addFields(
                                { name: '📄 Page Info', value: `Page ${page} of ${totalPages}`, inline: true },
                                { name: '👥 Total Users', value: allUsers.length.toString(), inline: true },
                                { name: '💡 Tip', value: 'Send messages to gain XP!', inline: true }
                            )
                            .setColor(0xffd700)
                            .setFooter({ text: 'GuardianBot XP Leaderboard | Use /rank to see your position' })
                            .setTimestamp();
                            
                        await interaction.reply({ embeds: [leaderboardEmbed] });
                    } catch (error) {
                        console.error('Error fetching leaderboard:', error);
                        await interaction.reply({ 
                            content: '❌ An error occurred while fetching leaderboard data!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    break;

                case 'addcommand':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to create custom commands!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const commandName = options.getString('name').toLowerCase().replace(/[^a-z0-9]/g, '');
                    const commandResponse = options.getString('response');
                    const deleteTrigger = options.getBoolean('delete_trigger') || false;
                    const dmResponse = options.getBoolean('dm_response') || false;
                    
                    if (commandName.length < 2) {
                        return interaction.reply({ 
                            content: '❌ Command name must be at least 2 characters long and contain only letters/numbers!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    
                    try {
                        const success = await this.dbManager.addCustomCommand(
                            interaction.guild.id,
                            commandName,
                            commandResponse,
                            interaction.user.id,
                            interaction.user.username,
                            deleteTrigger,
                            dmResponse
                        );
                        
                        if (success) {
                            const successEmbed = new EmbedBuilder()
                                .setTitle('✅ Custom Command Created!')
                                .setDescription(`Command **!${commandName}** has been created successfully!`)
                                .addFields(
                                    { name: '📝 Response', value: commandResponse, inline: false },
                                    { name: '🗑️ Delete Trigger', value: deleteTrigger ? 'Yes' : 'No', inline: true },
                                    { name: '📩 DM Response', value: dmResponse ? 'Yes' : 'No', inline: true },
                                    { name: '💡 Usage', value: `Type **!${commandName}** to trigger`, inline: false }
                                )
                                .setColor(0x00ff00)
                                .setFooter({ text: 'GuardianBot Custom Commands' })
                                .setTimestamp();
                                
                            await interaction.reply({ embeds: [successEmbed] });
                        } else {
                            await interaction.reply({ 
                                content: '❌ Failed to create custom command. Please try again!', 
                                flags: MessageFlags.Ephemeral 
                            });
                        }
                    } catch (error) {
                        console.error('Error creating custom command:', error);
                        await interaction.reply({ 
                            content: '❌ An error occurred while creating the command!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    break;

                case 'removecommand':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to delete custom commands!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const deleteCommandName = options.getString('name').toLowerCase();
                    
                    try {
                        const deleted = await this.dbManager.deleteCustomCommand(interaction.guild.id, deleteCommandName);
                        
                        if (deleted) {
                            await interaction.reply({ 
                                content: `✅ Custom command **!${deleteCommandName}** has been deleted!`, 
                                flags: MessageFlags.Ephemeral 
                            });
                        } else {
                            await interaction.reply({ 
                                content: `❌ Command **!${deleteCommandName}** not found!`, 
                                flags: MessageFlags.Ephemeral 
                            });
                        }
                    } catch (error) {
                        console.error('Error deleting custom command:', error);
                        await interaction.reply({ 
                            content: '❌ An error occurred while deleting the command!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    break;

                case 'commands':
                    try {
                        const customCommands = await this.dbManager.getGuildCustomCommands(interaction.guild.id);
                        
                        if (customCommands.length === 0) {
                            return interaction.reply({ 
                                content: '❌ No custom commands found! Use `/addcommand` to create one.', 
                                flags: MessageFlags.Ephemeral 
                            });
                        }
                        
                        const commandList = customCommands
                            .map(cmd => `• **!${cmd.command_name}** - ${cmd.uses} uses (by ${cmd.created_by_username})`)
                            .join('\n');
                        
                        const commandsEmbed = new EmbedBuilder()
                            .setTitle(`📋 Custom Commands - ${interaction.guild.name}`)
                            .setDescription(commandList)
                            .addFields(
                                { name: '📊 Total Commands', value: customCommands.length.toString(), inline: true },
                                { name: '💡 Usage', value: 'Type any command with ! prefix', inline: true }
                            )
                            .setColor(0x0099ff)
                            .setFooter({ text: 'GuardianBot Custom Commands | Use /addcommand to create more' })
                            .setTimestamp();
                            
                        await interaction.reply({ embeds: [commandsEmbed] });
                    } catch (error) {
                        console.error('Error fetching custom commands:', error);
                        await interaction.reply({ 
                            content: '❌ An error occurred while fetching commands!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    break;

                case 'rolereward':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to manage role rewards!', flags: MessageFlags.Ephemeral });
                    }
                    
                    const rewardRole = options.getRole('role');
                    const requiredLevel = options.getInteger('level');
                    const removePrevious = options.getBoolean('remove_previous') || false;
                    
                    try {
                        const success = await this.dbManager.addRoleReward(
                            interaction.guild.id,
                            rewardRole.id,
                            rewardRole.name,
                            requiredLevel,
                            removePrevious,
                            interaction.user.id
                        );
                        
                        if (success) {
                            const rewardEmbed = new EmbedBuilder()
                                .setTitle('🏆 Role Reward Added!')
                                .setDescription(`Users will now receive the **${rewardRole.name}** role when they reach level **${requiredLevel}**!`)
                                .addFields(
                                    { name: '🎭 Role', value: `<@&${rewardRole.id}>`, inline: true },
                                    { name: '📈 Level Required', value: requiredLevel.toString(), inline: true },
                                    { name: '🔄 Remove Previous', value: removePrevious ? 'Yes' : 'No', inline: true }
                                )
                                .setColor(0xffd700)
                                .setFooter({ text: 'GuardianBot Role Rewards' })
                                .setTimestamp();
                                
                            await interaction.reply({ embeds: [rewardEmbed] });
                        } else {
                            await interaction.reply({ 
                                content: '❌ Failed to add role reward. Please try again!', 
                                flags: MessageFlags.Ephemeral 
                            });
                        }
                    } catch (error) {
                        console.error('Error adding role reward:', error);
                        await interaction.reply({ 
                            content: '❌ An error occurred while adding the role reward!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    break;

                case 'automod':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You don\'t have permission to manage auto-moderation!', flags: MessageFlags.Ephemeral });
                    }

                    const subcommand = options.getSubcommand();

                    try {
                        switch (subcommand) {
                            case 'status':
                                const statusEmbed = new EmbedBuilder()
                                    .setTitle('🛡️ Auto-Moderation Status')
                                    .setDescription('Current auto-moderation configuration for this server')
                                    .addFields(
                                        { name: '🚫 Discord Invites', value: '✅ **Enabled** - Auto-delete and warn', inline: true },
                                        { name: '⚡ Escalation System', value: '✅ **Active** - Progressive punishments', inline: true },
                                        { name: '📊 Violation Tracking', value: '✅ **Logging** - All violations recorded', inline: true },
                                        { name: '🔄 Punishment Scale', value: 'Warn → 5m mute → 30m mute → 2h mute → Ban', inline: false },
                                        { name: '🛡️ Staff Bypass', value: 'Staff members are exempt from auto-moderation', inline: false }
                                    )
                                    .setColor(0x00ff00)
                                    .setFooter({ text: 'GuardianBot Auto-Moderation | Use /automod violations to see recent activity' })
                                    .setTimestamp();

                                await interaction.reply({ embeds: [statusEmbed] });
                                break;

                            case 'violations':
                                const targetUser = options.getUser('user');
                                const limit = options.getInteger('limit') || 10;

                                let violations;
                                if (targetUser) {
                                    violations = await this.dbManager.getAutoModViolations(interaction.guild.id, targetUser.id, null, limit);
                                } else {
                                    violations = await this.dbManager.getGuildAutoModViolations(interaction.guild.id, null, limit);
                                }

                                if (violations.length === 0) {
                                    const noViolationsEmbed = new EmbedBuilder()
                                        .setTitle('📊 Auto-Moderation Violations')
                                        .setDescription(targetUser ? `No violations found for ${targetUser.tag}` : 'No recent violations in this server')
                                        .setColor(0x00ff00)
                                        .setTimestamp();

                                    return interaction.reply({ embeds: [noViolationsEmbed] });
                                }

                                const violationsEmbed = new EmbedBuilder()
                                    .setTitle('📊 Auto-Moderation Violations')
                                    .setDescription(targetUser ? `Recent violations for ${targetUser.tag}` : `Last ${violations.length} violations in this server`)
                                    .setColor(0xff4444);

                                violations.slice(0, 10).forEach((violation, index) => {
                                    const violationType = violation.violation_type.replace('_', ' ').toUpperCase();
                                    const punishment = violation.punishment_applied || 'Warning';
                                    const timeAgo = new Date(violation.created_at).toLocaleString();
                                    
                                    violationsEmbed.addFields({
                                        name: `${index + 1}. ${violationType} - ${punishment}`,
                                        value: `**User:** <@${violation.user_id}>\n**Time:** ${timeAgo}\n**Content:** ${violation.message_content?.substring(0, 100) || 'N/A'}${violation.message_content?.length > 100 ? '...' : ''}`,
                                        inline: false
                                    });
                                });

                                violationsEmbed.setFooter({ text: `GuardianBot Auto-Moderation | Showing ${violations.length} violation(s)` });
                                violationsEmbed.setTimestamp();

                                await interaction.reply({ embeds: [violationsEmbed] });
                                break;

                            case 'stats':
                                const days = options.getInteger('days') || 7;
                                const stats = await this.dbManager.getAutoModStats(interaction.guild.id, days);

                                const statsEmbed = new EmbedBuilder()
                                    .setTitle('📈 Auto-Moderation Statistics')
                                    .setDescription(`Server auto-moderation activity over the last ${days} days`)
                                    .setColor(0x0099ff);

                                if (stats.length === 0) {
                                    statsEmbed.addFields({ name: '✅ Clean Record', value: 'No auto-moderation violations in the specified period!', inline: false });
                                } else {
                                    const violationCounts = {};
                                    stats.forEach(stat => {
                                        if (!violationCounts[stat.violation_type]) {
                                            violationCounts[stat.violation_type] = { total: 0, users: new Set() };
                                        }
                                        violationCounts[stat.violation_type].total += stat.total_violations;
                                        violationCounts[stat.violation_type].users.add(stat.unique_users);
                                    });

                                    Object.keys(violationCounts).forEach(type => {
                                        const typeData = violationCounts[type];
                                        const typeName = type.replace('_', ' ').toUpperCase();
                                        statsEmbed.addFields({
                                            name: `${typeName}`,
                                            value: `**${typeData.total}** violations\n**${typeData.users.size}** unique users`,
                                            inline: true
                                        });
                                    });

                                    const totalViolations = Object.values(violationCounts).reduce((sum, data) => sum + data.total, 0);
                                    statsEmbed.addFields({ 
                                        name: '📊 Summary', 
                                        value: `**${totalViolations}** total violations in **${days}** days`, 
                                        inline: false 
                                    });
                                }

                                statsEmbed.setFooter({ text: 'GuardianBot Auto-Moderation | Use /automod violations for detailed logs' });
                                statsEmbed.setTimestamp();

                                await interaction.reply({ embeds: [statsEmbed] });
                                break;

                            case 'invites':
                                const enabled = options.getBoolean('enabled');
                                
                                // For now, we'll just show status since the filtering is always enabled
                                const inviteStatusEmbed = new EmbedBuilder()
                                    .setTitle('🚫 Discord Invite Filtering')
                                    .setDescription(enabled ? 
                                        '✅ **Discord invite filtering is ENABLED**\n\nInvite links will be automatically deleted and users will be warned with escalating punishments.' :
                                        '❌ **Discord invite filtering is DISABLED**\n\nNote: This feature is currently always enabled for server security. Contact an administrator to modify this setting.'
                                    )
                                    .addFields(
                                        { name: '⚡ Escalation System', value: 'Warn → 5min mute → 30min mute → 2hr mute → Ban', inline: false },
                                        { name: '🛡️ Staff Bypass', value: 'Staff members with moderation permissions are exempt', inline: false }
                                    )
                                    .setColor(enabled ? 0x00ff00 : 0xff4444)
                                    .setFooter({ text: 'GuardianBot Auto-Moderation' })
                                    .setTimestamp();

                                await interaction.reply({ embeds: [inviteStatusEmbed] });
                                break;

                            default:
                                await interaction.reply({ content: '❌ Unknown auto-moderation subcommand!', flags: MessageFlags.Ephemeral });
                        }
                    } catch (error) {
                        console.error('Error handling automod command:', error);
                        await interaction.reply({ 
                            content: '❌ An error occurred while processing the auto-moderation command!', 
                            flags: MessageFlags.Ephemeral 
                        });
                    }
                    break;

                default:
                    await interaction.reply({ content: '❌ Unknown command! Use `/help` to see available commands.', flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            console.error('Error handling slash command:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ An error occurred while processing your command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: '❌ An error occurred while processing your command!', flags: MessageFlags.Ephemeral });
            }
        }
    }

    async logEvent(guild, title, description, color = 0x0099ff) {
        const logChannelId = config.logChannelId;
        if (!logChannelId) return;

        try {
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor(color)
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Failed to send to log channel:', error);
        }
    }

    // Level Up Handler
    async handleLevelUp(message, xpResult) {
        try {
            // Automatic level up messages are disabled
            // Users can check their rank/level using the /rank command
            
            // Check for role rewards
            const roleRewards = await this.dbManager.getRoleRewardsForLevel(message.guild.id, xpResult.newLevel);
            if (roleRewards.length > 0) {
                await this.handleRoleRewards(message.member, roleRewards, xpResult.newLevel);
            }
        } catch (error) {
            console.error('Error handling level up:', error);
        }
    }

    // Handle automatic role assignment on level up
    async handleRoleRewards(member, roleRewards, newLevel) {
        try {
            for (const reward of roleRewards) {
                if (reward.required_level === newLevel) {
                    const role = member.guild.roles.cache.get(reward.role_id);
                    if (role && !member.roles.cache.has(reward.role_id)) {
                        await member.roles.add(role, `Level ${newLevel} role reward`);
                        
                        const rewardEmbed = new EmbedBuilder()
                            .setTitle('🏆 Role Reward!')
                            .setDescription(`**${member.user.username}** earned the **${reward.role_name}** role for reaching level **${newLevel}**!`)
                            .setColor(0xffd700)
                            .setTimestamp();
                            
                        const channel = member.guild.channels.cache.find(ch => ch.name.includes('general') || ch.name.includes('chat')) || 
                                       member.guild.systemChannel;
                        
                        if (channel) {
                            await channel.send({ embeds: [rewardEmbed] });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error handling role rewards:', error);
        }
    }

    // Custom Commands Handler
    async handleCustomCommand(message, command) {
        try {
            let response = command.command_response;
            
            // Replace variables in the response
            response = response
                .replace(/{user}/g, `<@${message.author.id}>`)
                .replace(/{user\.name}/g, message.author.username)
                .replace(/{user\.mention}/g, `<@${message.author.id}>`)
                .replace(/{server}/g, message.guild.name)
                .replace(/{channel}/g, `<#${message.channel.id}>`)
                .replace(/{membercount}/g, message.guild.memberCount.toString());

            // Handle DM response
            if (command.dm_response) {
                try {
                    await message.author.send(response);
                } catch (error) {
                    // If DM fails, send in channel
                    await message.channel.send(response);
                }
            } else {
                await message.channel.send(response);
            }

            // Delete trigger message if configured
            if (command.delete_trigger && message.deletable) {
                await message.delete();
            }
        } catch (error) {
            console.error('Error handling custom command:', error);
        }
    }

    async sendToLogChannel(guild, embed) {
        const logChannelId = config.logChannelId;
        if (!logChannelId) return;

        try {
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Failed to send to log channel:', error);
        }
    }

    // Role change logging methods
    async logMemberRoleChanges(oldMember, newMember) {
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;
        
        // Find added roles
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
        
        // Log each added role
        for (const role of addedRoles.values()) {
            await this.logRoleAction(
                newMember.guild,
                'MEMBER_ROLE_ADD',
                role,
                null,
                newMember.user,
                `Role @${role.name} added to ${newMember.user.tag}`
            );
        }
        
        // Log each removed role
        for (const role of removedRoles.values()) {
            await this.logRoleAction(
                newMember.guild,
                'MEMBER_ROLE_REMOVE',
                role,
                null,
                newMember.user,
                `Role @${role.name} removed from ${newMember.user.tag}`
            );
        }
    }

    async logRoleAction(guild, actionType, role, oldRole = null, targetUser = null, reason = null) {
        try {
            // Check if logging is enabled
            if (!config.logging?.enabled) {
                return;
            }
            
            // Prepare old and new values for role updates
            let oldValues = null;
            let newValues = null;
            
            if (actionType === 'ROLE_UPDATE' && oldRole) {
                oldValues = JSON.stringify({
                    name: oldRole.name,
                    color: oldRole.color,
                    permissions: oldRole.permissions.bitfield.toString(),
                    mentionable: oldRole.mentionable,
                    hoist: oldRole.hoist,
                    position: oldRole.position
                });
                
                newValues = JSON.stringify({
                    name: role.name,
                    color: role.color,
                    permissions: role.permissions.bitfield.toString(),
                    mentionable: role.mentionable,
                    hoist: role.hoist,
                    position: role.position
                });
            }
            
            // Try to get the moderator who performed the action from audit logs
            let moderatorId = null;
            try {
                const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: this.getAuditLogType(actionType) });
                const auditEntry = auditLogs.entries.first();
                if (auditEntry && Date.now() - auditEntry.createdTimestamp < 5000) { // Within 5 seconds
                    moderatorId = auditEntry.executor.id;
                }
            } catch (auditError) {
                // Audit log access might be restricted
            }
            
            // Insert into database
            const query = `
                INSERT INTO role_logs 
                (guild_id, user_id, moderator_id, action_type, role_id, role_name, old_values, new_values, reason, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            await this.db.execute(query, [
                guild.id,
                targetUser?.id || null,
                moderatorId,
                actionType,
                role.id,
                role.name,
                oldValues,
                newValues,
                reason
            ]);
            
        } catch (error) {
            console.error('Error logging role action:', error);
        }
    }
    
    getAuditLogType(actionType) {
        const { AuditLogEvent } = require('discord.js');
        switch (actionType) {
            case 'ROLE_CREATE': return AuditLogEvent.RoleCreate;
            case 'ROLE_DELETE': return AuditLogEvent.RoleDelete;
            case 'ROLE_UPDATE': return AuditLogEvent.RoleUpdate;
            case 'MEMBER_ROLE_ADD':
            case 'MEMBER_ROLE_REMOVE': return AuditLogEvent.MemberRoleUpdate;
            default: return null;
        }
    }

    // Start the bot
    async start() {
        // Support both environment variable and config file for token
        const botToken = process.env.DISCORD_TOKEN || config.token;
        
        if (!botToken) {
            console.error('❌ No Discord token found! Set DISCORD_TOKEN environment variable or check config.json');
            process.exit(1);
        }
        
        console.log(`🔑 Using token source: ${process.env.DISCORD_TOKEN ? 'Environment Variable' : 'config.json'}`);
        this.client.login(botToken);
        
        // Initialize and start the dashboard server
        this.dashboard = new DashboardServer(this);
        try {
            await this.dashboard.start();
            console.log('🎯 Dashboard server initialization complete');
        } catch (error) {
            console.error('❌ Failed to start dashboard server:', error);
        }
    }
}

// Create and start the bot
const guardian = new GuardianBot();
guardian.start();

module.exports = GuardianBot;
