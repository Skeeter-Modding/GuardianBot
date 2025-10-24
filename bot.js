const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const DatabaseManager = require('./src/DatabaseManager');

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
        this.adminActions = new Map(); // userId -> array of action timestamps
        this.adminWarnings = new Map(); // userId -> warning count
        this.nukingActions = new Map(); // guildId -> array of nuke action timestamps
        this.lockdownStatus = new Map(); // guildId -> boolean
        this.originalPermissions = new Map(); // Store original permissions for safe unlock
        this.skeeterProtection = new Map(); // Track admins who target Skeeter - userId -> warning count
        this.adminCommandTracking = new Map(); // Track all admin commands - guildId -> array of commands
        this.ticketStats = new Map(); // Track ticket statistics - userId -> {claimed: number, closed: number, responseTime: array}
        this.activeTickets = new Map(); // Track active tickets - channelId -> {claimedBy: userId, claimTime: timestamp, creator: userId}

        // Database manager for persistent storage
        this.db = new DatabaseManager();

        // Trump-style AI responses
        this.trumpResponses = {
            skeeterWarning: [
                "Listen {user}, tagging Skeeter is a HUGE mistake, believe me. Nobody tags Skeeter - NOBODY! You're fired! 🔥",
                "{user}, you just made a tremendous error, probably the worst error in Discord history. Skeeter doesn't get tagged, okay? WRONG! ❌",
                "FAKE NEWS {user}! Tagging Skeeter is for losers and haters. You're a disaster, frankly. Total disaster! 💀",
                "{user}, I've seen many bad decisions in my time, but this? This is phenomenally bad. Skeeter tags are OFF LIMITS! 🚫",
                "Wrong wrong wrong {user}! Tagging Skeeter is like... it's like the worst deal ever made. You're out of line, bigly! 📉",
                "What the fuck is wrong with you {user}? Tagging Skeeter is the STUPIDEST shit I've ever seen! You're a complete moron! 🤡",
                "Are you fucking kidding me {user}? Skeeter doesn't get tagged, you dumb piece of shit! Learn the goddamn rules! 💢",
                "Listen here you little shit {user}, tagging Skeeter is off limits! You're dumber than a bag of rocks! Absolutely pathetic! 🗑️",
                "{user}, you ignorant asshole! Tagging Skeeter is like signing your own death warrant! You're fucked now! ⚰️",
                "Holy shit {user}, how fucking stupid can you be? Skeeter tags are BANNED, you worthless piece of garbage! 🚮",
                "Goddamn it {user}! You just committed the cardinal sin of this server! Tagging Skeeter? You're dead to me! 💀",
                "{user}, you absolute fucking idiot! Everyone knows you don't tag Skeeter! What's wrong with your brain? 🧠❌"
            ],
            raidDetected: [
                "We've got a MASSIVE raid, folks. HUGE raid. {count} people trying to infiltrate our beautiful server. Not happening! 🛑",
                "This raid is a complete disaster, maybe the worst raid in the history of raids. We're locking it down, believe me! 🔒",
                "FAKE raiders trying to destroy our incredible server! {count} losers trying to cause chaos. We have the BEST anti-raid! 💪",
                "Tremendous raid attempt, folks. {count} people - probably sent by the competition. We're shutting it down FAST! ⚡",
                "Holy shit! {count} fucking idiots just tried to raid us! These pathetic losers picked the WRONG server to mess with! 💀",
                "Are you fucking serious? {count} brain-dead morons think they can raid MY server? I'm about to destroy these assholes! 🔥",
                "What the hell? {count} piece of shit raiders just walked into a goddamn massacre! They're about to get WRECKED! ⚡",
                "These {count} dumb fucks thought they could raid us? WRONG! I'm going to obliterate every last one of these bastards! 💥"
            ],
            nukeAttempt: [
                "Somebody's trying to nuke our server - probably a nasty person, very nasty. Not on my watch! LOCKDOWN! 🚨",
                "HUGE nuke attempt detected! {action} happening {count} times. This is what losing looks like, folks! 💥",
                "We caught them red-handed! Trying to delete our beautiful channels. These people are sick! LOCKED DOWN! 🔐",
                "Major nuke attempt - probably the biggest nuke attempt ever seen. We stopped them cold, believe me! ❄️",
                "Some piece of shit is trying to nuke our server! {action} {count} times? You're fucked now, asshole! 💀",
                "What kind of braindead moron tries to nuke MY server? {action} {count} times? You're about to get destroyed! 🔥",
                "Holy fuck! Some pathetic loser is attempting to nuke us! {action} {count} times? Time to end this bitch! ⚡",
                "Are you kidding me? Some dumbass is nuking with {action} {count} times? I'm going to fuck them up so bad! 💥"
            ],
            rogueAdmin: [
                "Admin {admin} is going crazy, folks. Totally out of control! {actions} actions - that's not normal, that's deranged! 🤪",
                "{admin} is having a meltdown, a complete meltdown! We're taking away their powers - YOU'RE FIRED! 🔥",
                "This admin {admin} is a disaster, frankly. {actions} actions in a row? That's not winning, that's losing badly! 📉",
                "We have a rogue admin situation with {admin}. Sad! Very sad! We're making administrative changes immediately! ⚖️",
                "What the fuck is {admin} doing? {actions} actions? This admin has lost their goddamn mind! Time to shut this shit down! 💀",
                "{admin} is acting like a complete psychopath! {actions} actions? You're fucking FIRED, you crazy asshole! 🔥",
                "Holy shit! {admin} is on a power trip with {actions} actions! This dickhead is about to lose everything! ⚡",
                "{admin}, you absolute piece of shit! {actions} actions? You're done, motherfucker! Pack your bags! 🗑️"
            ],
            lockdown: [
                "Server is now in LOCKDOWN mode! Nobody gets in, nobody gets out. We have the BEST security, tremendous security! 🔒",
                "TOTAL LOCKDOWN activated! This server is now more secure than Fort Knox, believe me! 🏰",
                "We're locking this place down HARD! The security is incredible, probably the best security ever seen! 🛡️",
                "LOCKDOWN ENGAGED! This is what winning looks like, folks. Nobody beats our security! 🏆"
            ],
            emergency: [
                "EMERGENCY protocols activated! We're fixing this mess faster than you can say 'Make Discord Great Again!' 🚑",
                "This is a HUGE emergency, but we have the best emergency response - probably ever! We'll fix it! 🔧",
                "Emergency situation detected! Don't worry folks, we have tremendous people working on this! 👷",
                "BIG emergency, but we're handling it like champions! Nobody handles emergencies like we do! 🏅"
            ],
            botMentions: [
                "You called? I'm here, and I'm WINNING! This bot is tremendous, probably the best bot ever made! 🤖",
                "What's up {user}? You're talking to the GREATEST security bot in Discord history, believe me! 🏆",
                "Hey {user}! You just mentioned the most INCREDIBLE bot ever created. We're doing HUGE things here! 💪",
                "{user}, you have excellent taste mentioning me. I'm making Discord great again, one server at a time! 🇺🇸",
                "Listen {user}, you're smart for getting my attention. This bot is PHENOMENAL - ask anyone! 📈",
                "What can I do for you {user}? I'm the BEST at what I do - server protection like you've never seen! 🛡️",
                "{user}, you just tagged the most SUCCESSFUL security bot ever. We're protecting servers bigly! 🔒",
                "Hey there {user}! You're talking to a WINNER. This bot has the best features, tremendous features! ⭐",
                "What's happening {user}? You've got the attention of the ULTIMATE Discord guardian! Nobody protects like me! 🥇",
                "You called {user}? I'm here and ready to make your server GREAT AGAIN! We have the best protection! 🇺🇸",
                "Listen {user}, you just woke up the KING of Discord bots! I'm about to blow your fucking mind with how good this is! 👑",
                "What's good {user}? You're talking to a bot that's so damn good, it should be illegal! But it's not, so you're lucky as hell! 🔥",
                "Hey {user}! You tagged the most badass bot in Discord history! I'm so fucking awesome it hurts! 💥",
                "{user}, you smart son of a bitch! You know quality when you see it! This bot is absolutely fucking incredible! 🧠",
                "Damn right you called me {user}! I'm the most ruthless, most effective security bot ever built! Shit's about to get real! ⚡"
            ],
            generalResponses: [
                "That's a TREMENDOUS question {user}! Nobody asks questions like you do - fantastic! 🎯",
                "{user}, you're absolutely right! We're doing INCREDIBLE work here, probably the best work ever! 💯",
                "Listen {user}, what we're doing here is HUGE. This server is going to be so great, you won't believe it! 🚀",
                "{user}, I love your energy! You remind me of a WINNER! We're going to do great things together! 🏆",
                "That's SMART thinking {user}! You get it - you really get it! We're making Discord great again! 🧠",
                "{user}, you're looking at the FUTURE of Discord security! This is what winning looks like! 📊",
                "Incredible point {user}! You have the BEST insights, really the best! Nobody thinks like you! 💡",
                "{user}, you just said something PHENOMENAL! We're going to use that - beautiful idea! ✨",
                "Holy shit {user}, that's some next-level thinking right there! You're one smart motherfucker! 🎯",
                "Damn {user}, you just said something so fucking brilliant I might cry! That's pure genius! 💎",
                "Listen {user}, you're absolutely right and anyone who disagrees is a complete dumbass! You get it! 🔥",
                "{user}, that comment just made my day! You're sharp as hell and twice as smart! Keep that shit up! ⚡",
                "Fuck yeah {user}! That's exactly what I'm talking about! You understand this shit better than most! 💪"
            ],
            aggressiveResponses: [
                "Listen here {user}, you picked the WRONG bot to fuck with! I'm about to show you what real power looks like! 💀",
                "{user}, you must be out of your goddamn mind if you think you can mess with me! I'm the king of this shit! 👑",
                "Oh hell no {user}! You just stepped into the ring with the heavyweight champion of Discord bots! You're fucked! 🥊",
                "Are you kidding me {user}? You think you can challenge ME? I'll destroy you so fast it'll make your head spin! 🌪️",
                "{user}, you're about to learn why I'm the most feared bot in Discord! This is going to be BRUTAL! ⚡",
                "What the fuck {user}? You really want to test me? I'm about to unleash hell on your sorry ass! 🔥",
                "Listen {user}, you're messing with the wrong bot today! I'm going to make you regret that shit! 💥",
                "{user}, you dumb piece of shit! You have NO idea what you just started! I'm about to end your whole career! 📉"
            ]
        };

        this.setupSlashCommands();
        this.setupEventHandlers();
    }

    // Get random Trump-style response
    getTrumpResponse(category, replacements = {}) {
        const responses = this.trumpResponses[category];
        if (!responses || responses.length === 0) return "This is tremendous, believe me!";
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Replace placeholders with actual values
        let response = randomResponse;
        for (const [key, value] of Object.entries(replacements)) {
            response = response.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        
        return response;
    }

    // Define slash commands
    getSlashCommands() {
        return [
            new SlashCommandBuilder()
                .setName('lockdown')
                .setDescription('Lock down the entire server for security')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the lockdown')
                        .setRequired(false)
                ),
            
            new SlashCommandBuilder()
                .setName('unlock')
                .setDescription('Remove server lockdown')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for unlocking')
                        .setRequired(false)
                ),
            
            new SlashCommandBuilder()
                .setName('ban')
                .setDescription('Ban a user from the server')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to ban')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the ban')
                        .setRequired(false)
                ),
            
            new SlashCommandBuilder()
                .setName('kick')
                .setDescription('Kick a user from the server')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to kick')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the kick')
                        .setRequired(false)
                ),
            
            new SlashCommandBuilder()
                .setName('purge')
                .setDescription('Delete multiple messages')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Number of messages to delete (1-100)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)
                ),
            
            new SlashCommandBuilder()
                .setName('status')
                .setDescription('Show Guardian Bot protection status'),
            
            new SlashCommandBuilder()
                .setName('settings')
                .setDescription('Show current Guardian Bot settings'),
            
            new SlashCommandBuilder()
                .setName('emergency-restore')
                .setDescription('Emergency restore permissions after broken lockdown'),
            
            new SlashCommandBuilder()
                .setName('help')
                .setDescription('Show Guardian Bot commands and features'),
            
            // Ticket System Commands
            new SlashCommandBuilder()
                .setName('ticket')
                .setDescription('Create a new support ticket'),

            new SlashCommandBuilder()
                .setName('claim-ticket')
                .setDescription('Claim this support ticket (Staff Only)')
                .addUserOption(option =>
                    option.setName('assign-to')
                        .setDescription('Assign ticket to specific staff member')
                        .setRequired(false)
                ),

            new SlashCommandBuilder()
                .setName('close-ticket')
                .setDescription('Close this support ticket (Staff Only)')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for closing the ticket')
                        .setRequired(false)
                ),

            new SlashCommandBuilder()
                .setName('delete-ticket')
                .setDescription('Delete this support ticket permanently (Staff Only)')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for deleting the ticket')
                        .setRequired(false)
                ),

            new SlashCommandBuilder()
                .setName('ticket-panel')
                .setDescription('Create ticket creation panel (Admin Only)')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to create the panel in')
                        .setRequired(false)
                ),

            new SlashCommandBuilder()
                .setName('ticket-stats')
                .setDescription('View ticket statistics (Staff Only)')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('View stats for specific user')
                        .setRequired(false)
                ),

            new SlashCommandBuilder()
                .setName('ticket-transcript')
                .setDescription('Generate transcript of this ticket (Staff Only)')
        ];
    }

    // Register slash commands
    async setupSlashCommands() {
        const commands = this.getSlashCommands().map(command => command.toJSON());
        
        const rest = new REST({ version: '10' }).setToken(config.token);
        
        try {
            console.log('🔄 Refreshing slash commands...');
            
            // First, clear all existing commands to force refresh
            await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
            console.log('🗑️ Cleared old commands');
            
            // Wait a moment then register new commands
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
            console.log('✅ Slash commands refreshed successfully!');
        } catch (error) {
            console.error('❌ Error refreshing slash commands:', error);
        }
    }

    setupEventHandlers() {
        this.client.once('clientReady', async () => {
            console.log(`🛡️ Guardian Bot is online! Logged in as ${this.client.user.tag}`);
            this.client.user.setActivity('Protecting your server 🛡️', { type: 'WATCHING' });
            
            // Connect to database
            const dbConnected = await this.db.connect();
            if (dbConnected) {
                console.log('📊 Database connected - persistent storage enabled!');
            } else {
                console.log('📊 Database disabled - using memory storage only');
            }
        });

        // Anti-Raid Protection
        this.client.on('guildMemberAdd', (member) => {
            this.handleAntiRaid(member);
            this.logEvent(member.guild, 'Member Join', `${member.user.tag} (${member.user.id}) joined the server`, 0x00ff00);
        });

        // Admin Action Monitoring
        this.client.on('guildBanAdd', async (ban) => {
            // Check if banned user is protected and attempt to unban them
            if (config.protectedUsers && config.protectedUsers.includes(ban.user.id)) {
                try {
                    // Get ban information to check who banned them
                    const banInfo = await ban.guild.bans.fetch(ban.user.id).catch(() => null);
                    
                    // Automatically unban protected user
                    await ban.guild.members.unban(ban.user.id, 'Protected user automatically unbanned by Guardian Bot');
                    
                    // Alert about the protection
                    const protectEmbed = new EmbedBuilder()
                        .setTitle('🛡️ PROTECTED USER AUTO-UNBANNED')
                        .setDescription(`**${ban.user.tag} is protected and was automatically unbanned!**\n\nProtected users can only be banned by the server owner.`)
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '🔄 Action Taken', value: 'Automatic Unban', inline: true },
                            { name: '🛡️ Protection Level', value: 'Maximum Security', inline: true },
                            { name: '⚡ Response Time', value: 'Instant', inline: true }
                        )
                        .setFooter({ text: 'Guardian Bot Protection System - Nobody touches our protected users!' })
                        .setTimestamp();

                    // Log the protection event
                    await this.logEvent(ban.guild, 'Protected User Auto-Unbanned', 
                        `${ban.user.tag} was automatically unbanned due to protection status`, 0x00ff00);
                        
                    // Try to send the embed to a log channel if possible
                    const logChannel = ban.guild.channels.cache.get(config.logChannelId);
                    if (logChannel) {
                        await logChannel.send({ embeds: [protectEmbed] });
                    }
                } catch (error) {
                    console.error('Failed to unban protected user:', error);
                    await this.logEvent(ban.guild, 'Protected User Ban Alert', 
                        `CRITICAL: Protected user ${ban.user.tag} was banned but auto-unban failed!`, 0xff0000);
                }
            }
            
            this.handleAdminAction(ban.guild, 'ban');
            this.checkSkeeterProtection(ban.guild, ban.user, 'ban');
            this.logEvent(ban.guild, 'Member Banned', `${ban.user.tag} (${ban.user.id}) was banned`, 0xff0000);
        });

        this.client.on('guildMemberRemove', (member) => {
            this.handleAdminAction(member.guild, 'kick');
            this.checkSkeeterProtection(member.guild, member.user, 'kick');
            this.logEvent(member.guild, 'Member Left/Kicked', `${member.user.tag} (${member.user.id}) left or was kicked`, 0xffa500);
        });

        // Monitor member updates for mutes/timeouts targeting Skeeter
        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
            // Check for timeout/mute changes
            if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil && 
                newMember.communicationDisabledUntil) {
                this.checkSkeeterProtection(newMember.guild, newMember.user, 'timeout');
            }

            // Monitor for role changes that might indicate admin abuse
            if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
                this.logEvent(newMember.guild, 'Member Role Update', 
                    `${newMember.user.tag}'s roles were modified`, 0x0099ff);
            }
        });

        // Anti-Nuke Protection and Ticket Monitoring
        this.client.on('channelDelete', (channel) => {
            // Check if it's a ticket channel being closed
            if (this.isTicketChannel(channel)) {
                this.handleTicketClosure(channel);
            }
            
            this.handleAntiNuke(channel.guild, 'channelDelete');
            this.logEvent(channel.guild, 'Channel Deleted', `Channel #${channel.name} was deleted`, 0xff0000);
        });

        this.client.on('roleDelete', (role) => {
            this.handleAntiNuke(role.guild, 'roleDelete');
            this.logEvent(role.guild, 'Role Deleted', `Role @${role.name} was deleted`, 0xff0000);
        });

        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
            // Monitor for role changes that might indicate admin abuse
            if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
                this.logEvent(newMember.guild, 'Member Role Update', 
                    `${newMember.user.tag}'s roles were modified`, 0x0099ff);
            }
        });

        // Command handling - both slash commands and legacy text commands
        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction);
            } else if (interaction.isButton()) {
                await this.handleTicketInteraction(interaction);
            } else if (interaction.isModalSubmit()) {
                await this.handleModalSubmit(interaction);
            }
        });

        this.client.on('messageCreate', (message) => {
            if (message.author.bot) return;
            
            // Check if message is in a ticket channel
            this.checkTicketActivity(message);
            
            // Check for bot mentions first (highest priority)
            if (this.checkBotMention(message)) {
                this.handleBotMention(message);
                return; // Don't process other checks if bot was mentioned
            }
            
            // Check for Skeeter mentions second
            if (this.checkSkeeterMention(message)) {
                console.log(`🚨 Skeeter mention detected from ${message.author.username}: ${message.content}`);
                this.handleSkeeterMention(message);
                return; // Don't process as a command if it's a Skeeter mention
            }
            
            // Handle legacy text commands
            if (!message.content.startsWith('!')) return;
            this.handleCommand(message);
        });

        // Error handling
        this.client.on('error', console.error);
        this.client.on('warn', console.warn);
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
            .setFooter({ text: 'Make Discord Great Again! 🇺🇸' })
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
                if (!member.user.bot && member.kickable) {
                    try {
                        await member.kick('TRUMP AUTO-KICK: Raid detected - You\'re fired! 🔥');
                    } catch (error) {
                        console.error(`Failed to kick ${member.user.tag}:`, error);
                    }
                }
            }
        }
    }

    // Anti-Nuke System
    async handleAntiNuke(guild, actionType) {
        if (!config.antiNuke.enabled) return;

        const now = Date.now();
        
        if (!this.nukingActions.has(guild.id)) {
            this.nukingActions.set(guild.id, []);
        }

        const actions = this.nukingActions.get(guild.id);
        actions.push({ type: actionType, timestamp: now });

        // Clean old entries
        const validActions = actions.filter(action => now - action.timestamp < config.antiNuke.timeWindow);
        this.nukingActions.set(guild.id, validActions);

        const threshold = actionType === 'channelDelete' ? config.antiNuke.channelDeleteThreshold : config.antiNuke.roleDeleteThreshold;
        const typeActions = validActions.filter(action => action.type === actionType);

        if (typeActions.length >= threshold) {
            await this.triggerNukeProtection(guild, actionType, typeActions.length);
        }
    }

    async triggerNukeProtection(guild, actionType, actionCount) {
        const trumpTrashTalk = this.getTrumpResponse('nukeAttempt', { 
            action: actionType, 
            count: actionCount 
        });
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 NUKE ATTEMPT DETECTED!')
            .setDescription(`**${trumpTrashTalk}**`)
            .setColor(0xff0000)
            .addFields(
                { name: '💥 TRUMP SAYS', value: 'These nukers are pathetic! Totally pathetic!', inline: false },
                { name: '📊 Attack Details', value: `${actionCount} ${actionType} actions in ${config.antiNuke.timeWindow/1000} seconds`, inline: false }
            )
            .setFooter({ text: 'We have the BEST anti-nuke protection! 🛡️' })
            .setTimestamp();

        await this.sendToLogChannel(guild, embed);
        
        const lockdownTrashTalk = this.getTrumpResponse('lockdown');
        await this.lockdownServer(guild, `Auto-lockdown: ${trumpTrashTalk}`);

        if (config.antiNuke.banNukers) {
            // This would require audit log inspection to identify the nuker
            // Implementation would need additional audit log permissions
        }
    }

    // Ticket Monitoring System
    isTicketChannel(channel) {
        // Common ticket channel patterns
        const ticketPatterns = [
            /ticket-/i,
            /support-/i,
            /help-/i,
            /\d{4,}/  // Contains 4+ digits (common in ticket systems)
        ];
        
        return ticketPatterns.some(pattern => pattern.test(channel.name)) ||
               channel.parent?.name.toLowerCase().includes('ticket') ||
               channel.parent?.name.toLowerCase().includes('support');
    }

    async handleTicketInteraction(interaction) {
        if (!interaction.isButton()) return;

        const customId = interaction.customId;
        const user = interaction.user;
        const channel = interaction.channel;

        // Handle ticket panel creation button
        if (customId === 'create_ticket_panel') {
            // Create modal for ticket creation
            const modal = new ModalBuilder()
                .setCustomId('ticket_creation_modal')
                .setTitle('🎫 Create Support Ticket');

            const subjectInput = new TextInputBuilder()
                .setCustomId('ticket_subject')
                .setLabel('Subject')
                .setPlaceholder('Brief description of your issue...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(100);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('ticket_description')
                .setLabel('Detailed Description')
                .setPlaceholder('Please provide more details about your issue...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(1000);

            const priorityInput = new TextInputBuilder()
                .setCustomId('ticket_priority')
                .setLabel('Priority (high/medium/low)')
                .setPlaceholder('high, medium, or low')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(6)
                .setValue('medium');

            const firstActionRow = new ActionRowBuilder().addComponents(subjectInput);
            const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(priorityInput);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            await interaction.showModal(modal);
            return;
        }

        // Handle ticket claim buttons
        if (customId.startsWith('claim_ticket_')) {
            const channelId = customId.replace('claim_ticket_', '');
            if (channelId !== channel.id) return;

            await this.handleTicketClaim(interaction, user, channel);
        }
        // Handle ticket close buttons
        else if (customId.startsWith('close_ticket_')) {
            const channelId = customId.replace('close_ticket_', '');
            if (channelId !== channel.id) return;

            await this.handleTicketClose(interaction, user, channel);
        }
        // Handle ticket delete buttons
        else if (customId.startsWith('delete_ticket_')) {
            const channelId = customId.replace('delete_ticket_', '');
            if (channelId !== channel.id) return;

            await this.handleTicketDelete(interaction, user, channel);
        }
        // Handle transcript buttons
        else if (customId.startsWith('transcript_ticket_')) {
            const channelId = customId.replace('transcript_ticket_', '');
            if (channelId !== channel.id) return;

            await this.handleTicketTranscriptButton(interaction, user, channel);
        }
    }

    async handleTicketStatsCommand(interaction) {
        if (!this.hasPermission(interaction.member)) {
            return interaction.reply({
                content: '❌ Only staff members can view ticket statistics!',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const guild = interaction.guild;

        if (targetUser) {
            // Show stats for specific user
            const stats = this.ticketStats.get(targetUser.id);
            if (!stats) {
                return interaction.reply({
                    content: `❌ No ticket statistics found for ${targetUser.tag}!`,
                    ephemeral: true
                });
            }

            const avgResponseTime = stats.responseTime.length > 0 
                ? Math.round((stats.responseTime.reduce((a, b) => a + b, 0) / stats.responseTime.length) / 60000)
                : 0;

            const efficiency = stats.claimed > 0 ? Math.round((stats.closed / stats.claimed) * 100) : 0;

            const userStatsEmbed = new EmbedBuilder()
                .setTitle(`🎫 TICKET STATISTICS - ${targetUser.tag}`)
                .setDescription(`Detailed performance statistics for ${targetUser.toString()}`)
                .setColor(0x0099ff)
                .addFields(
                    { name: '🎫 Total Claimed', value: `${stats.claimed}`, inline: true },
                    { name: '✅ Total Closed', value: `${stats.closed}`, inline: true },
                    { name: '⚡ Avg Response Time', value: `${avgResponseTime} minutes`, inline: true },
                    { name: '📊 Efficiency Rate', value: `${efficiency}%`, inline: true },
                    { name: '💬 Total Responses', value: `${stats.responseTime.length}`, inline: true },
                    { name: '🏆 Performance', value: efficiency >= 80 ? '🥇 Excellent' : efficiency >= 60 ? '🥈 Good' : '🥉 Needs Improvement', inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: 'Guardian Bot Ticket System' })
                .setTimestamp();

            await interaction.reply({ embeds: [userStatsEmbed], ephemeral: true });
        } else {
            // Show general server stats
            const allStats = Array.from(this.ticketStats.entries())
                .map(([userId, stats]) => {
                    const member = guild.members.cache.get(userId);
                    if (!member) return null;
                    
                    const avgResponseTime = stats.responseTime.length > 0 
                        ? Math.round((stats.responseTime.reduce((a, b) => a + b, 0) / stats.responseTime.length) / 60000)
                        : 0;
                    
                    return {
                        userId,
                        tag: member.user.tag,
                        claimed: stats.claimed || 0,
                        closed: stats.closed || 0,
                        avgResponseTime,
                        efficiency: stats.claimed > 0 ? Math.round((stats.closed / stats.claimed) * 100) : 0
                    };
                })
                .filter(stat => stat !== null && (stat.claimed > 0 || stat.closed > 0))
                .sort((a, b) => b.closed - a.closed)
                .slice(0, 10); // Top 10

            const activeTicketsCount = this.activeTickets.size;
            const totalClaimed = allStats.reduce((sum, stat) => sum + stat.claimed, 0);
            const totalClosed = allStats.reduce((sum, stat) => sum + stat.closed, 0);

            const statsEmbed = new EmbedBuilder()
                .setTitle('🎫 SERVER TICKET STATISTICS')
                .setDescription('Overview of ticket system performance')
                .setColor(0x0099ff)
                .addFields(
                    { name: '📊 Current Active Tickets', value: `${activeTicketsCount}`, inline: true },
                    { name: '🎫 Total Claimed', value: `${totalClaimed}`, inline: true },
                    { name: '✅ Total Closed', value: `${totalClosed}`, inline: true }
                );

            if (allStats.length > 0) {
                const leaderboard = allStats.map((stat, index) => 
                    `${index + 1}. **${stat.tag}** - ${stat.closed} closed (${stat.efficiency}% efficiency)`
                ).join('\n');

                statsEmbed.addFields(
                    { name: '🏆 TOP PERFORMERS', value: leaderboard, inline: false }
                );
            }

            statsEmbed.setFooter({ text: 'Guardian Bot Ticket System' })
                .setTimestamp();

            await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
        }
    }

    async handleTicketTranscriptCommand(interaction) {
        if (!this.hasPermission(interaction.member)) {
            return interaction.reply({
                content: '❌ Only staff members can generate transcripts!',
                ephemeral: true
            });
        }

        if (!this.isTicketChannel(interaction.channel)) {
            return interaction.reply({
                content: '❌ This command can only be used in ticket channels!',
                ephemeral: true
            });
        }

        const ticket = this.activeTickets.get(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ No ticket data found for this channel!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            await this.generateTranscript(interaction.channel, ticket, interaction.user, 'Manual transcript generation');
            await interaction.editReply('✅ Transcript generated successfully!');
        } catch (error) {
            await interaction.editReply('❌ Failed to generate transcript!');
        }
    }

    async handleTicketTranscriptButton(interaction, user, channel) {
        if (!this.hasPermission(interaction.member)) {
            return interaction.reply({
                content: '❌ Only staff members can generate transcripts!',
                ephemeral: true
            });
        }

        const ticket = this.activeTickets.get(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ No ticket data found for this channel!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            await this.generateTranscript(channel, ticket, user, 'Transcript requested via button');
            await interaction.editReply('✅ Transcript generated successfully!');
        } catch (error) {
            await interaction.editReply('❌ Failed to generate transcript!');
        }
    }

    async handleModalSubmit(interaction) {
        if (interaction.customId === 'ticket_modal' || interaction.customId === 'ticket_creation_modal') {
            const subject = interaction.fields.getTextInputValue('ticket_subject');
            const description = interaction.fields.getTextInputValue('ticket_description');
            const priority = interaction.fields.getTextInputValue('ticket_priority')?.toLowerCase() || 'medium';

            // Validate priority
            const validPriorities = ['high', 'medium', 'low'];
            const finalPriority = validPriorities.includes(priority) ? priority : 'medium';

            await this.createTicketFromModal(interaction, subject, description, finalPriority);
        }
    }

    // Ticket Monitoring System

    async handleTicketClaim(interaction, user, channel) {
        if (!this.hasPermission(interaction.member)) {
            return interaction.reply({ content: '❌ Only staff can claim tickets!', ephemeral: true });
        }

        // Check if ticket is already claimed
        const existingTicket = this.activeTickets.get(channel.id);
        if (existingTicket && existingTicket.claimedBy) {
            const claimedUser = await interaction.guild.members.fetch(existingTicket.claimedBy).catch(() => null);
            return interaction.reply({ 
                content: `❌ This ticket is already claimed by ${claimedUser ? claimedUser.user.tag : 'someone'}!`, 
                ephemeral: true 
            });
        }

        // Get staff type for display
        const staffType = this.getStaffType(interaction.member);

        // Claim the ticket
        this.activeTickets.set(channel.id, {
            claimedBy: user.id,
            claimTime: Date.now(),
            creator: existingTicket?.creator || null,
            staffType: staffType
        });

        // Update stats
        const stats = this.ticketStats.get(user.id) || { claimed: 0, closed: 0, responseTime: [] };
        stats.claimed++;
        this.ticketStats.set(user.id, stats);

        const trumpResponse = this.getTrumpResponse('generalResponses', { user: user.toString() });

        const claimEmbed = new EmbedBuilder()
            .setTitle('🎫 TICKET CLAIMED!')
            .setDescription(`**${user.tag} just claimed this ticket!**\n\n${trumpResponse}`)
            .setColor(0x00ff00)
            .addFields(
                { name: '👨‍💼 Claimed By', value: `${user.toString()}\n${staffType}`, inline: true },
                { name: '⏰ Claim Time', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                { name: '📊 Total Claims', value: `${stats.claimed}`, inline: true }
            )
            .setFooter({ text: 'Guardian Bot Ticket System - Making Support Great Again! 🇺🇸' })
            .setTimestamp();

        await interaction.reply({ embeds: [claimEmbed] });
        await this.logEvent(interaction.guild, 'Ticket Claimed', 
            `${staffType} ${user.tag} claimed ticket in ${channel.name} - Total claims: ${stats.claimed}`, 0x00ff00);
    }

    async handleTicketClose(interaction, user, channel) {
        // Check if user has permission to close tickets
        if (!this.hasPermission(interaction.member)) {
            return interaction.reply({ content: '❌ Only staff can close tickets!', ephemeral: true });
        }

        const ticket = this.activeTickets.get(channel.id);
        if (!ticket) {
            return interaction.reply({ content: '❌ No active ticket data found!', ephemeral: true });
        }

        // Get staff type for display
        const staffType = this.getStaffType(interaction.member);

        // Calculate response time if ticket was claimed
        let responseTime = 0;
        if (ticket.claimTime) {
            responseTime = Date.now() - ticket.claimTime;
        }

        // Update stats for the closer
        const stats = this.ticketStats.get(user.id) || { claimed: 0, closed: 0, responseTime: [] };
        stats.closed++;
        if (responseTime > 0) {
            stats.responseTime.push(responseTime);
        }
        this.ticketStats.set(user.id, stats);

        const trumpResponse = this.getTrumpResponse('generalResponses', { user: user.toString() });

        const closeEmbed = new EmbedBuilder()
            .setTitle('🎫 TICKET CLOSED!')
            .setDescription(`**${user.tag} closed this ticket!**\n\n${trumpResponse}`)
            .setColor(0xff6600)
            .addFields(
                { name: '🔒 Closed By', value: `${user.toString()}\n${staffType}`, inline: true },
                { name: '⏱️ Resolution Time', value: responseTime > 0 ? `${Math.round(responseTime / 60000)} minutes` : 'N/A', inline: true },
                { name: '📊 Total Closed', value: `${stats.closed}`, inline: true }
            )
            .setFooter({ text: 'Guardian Bot Ticket System - Tremendous Support! 🏆' })
            .setTimestamp();

        await interaction.reply({ embeds: [closeEmbed] });
        await this.logEvent(interaction.guild, 'Ticket Closed', 
            `${staffType} ${user.tag} closed ticket in ${channel.name} - Total closed: ${stats.closed}`, 0xff6600);

        // Remove from active tickets
        this.activeTickets.delete(channel.id);
    }

    async handleTicketDelete(interaction, user, channel) {
        // Check if user has permission to delete tickets
        if (!this.hasPermission(interaction.member)) {
            return interaction.reply({ content: '❌ Only staff can delete tickets!', ephemeral: true });
        }

        const ticket = this.activeTickets.get(channel.id);
        if (!ticket) {
            return interaction.reply({ content: '❌ No active ticket data found!', ephemeral: true });
        }

        // Get staff type for display
        const staffType = this.getStaffType(interaction.member);

        // Calculate response time if ticket was claimed
        let responseTime = 0;
        if (ticket.claimTime) {
            responseTime = Date.now() - ticket.claimTime;
        }

        // Update stats for the deleter
        const stats = this.ticketStats.get(user.id) || { claimed: 0, closed: 0, responseTime: [], deleted: 0 };
        stats.deleted = (stats.deleted || 0) + 1;
        if (responseTime > 0) {
            stats.responseTime.push(responseTime);
        }
        this.ticketStats.set(user.id, stats);

        const trumpResponse = this.getTrumpResponse('generalResponses', { user: user.toString() });

        const deleteEmbed = new EmbedBuilder()
            .setTitle('🗑️ TICKET DELETED!')
            .setDescription(`**${user.tag} deleted this ticket!**\n\n${trumpResponse}\n\n⚠️ **This channel will be permanently deleted in 10 seconds!**`)
            .setColor(0x8B0000)
            .addFields(
                { name: '🗑️ Deleted By', value: `${user.toString()}\n${staffType}`, inline: true },
                { name: '⏱️ Response Time', value: responseTime > 0 ? `${Math.round(responseTime / 60000)} minutes` : 'N/A', inline: true },
                { name: '📊 Total Deleted', value: `${stats.deleted}`, inline: true }
            )
            .setFooter({ text: 'Guardian Bot Ticket System - DELETED PERMANENTLY! 🗑️' })
            .setTimestamp();

        await interaction.reply({ embeds: [deleteEmbed] });
        await this.logEvent(interaction.guild, 'Ticket Deleted', 
            `${staffType} ${user.tag} deleted ticket in ${channel.name} - Total deleted: ${stats.deleted}`, 0x8B0000);

        // Remove from active tickets
        this.activeTickets.delete(channel.id);

        // Delete the channel after a short delay
        setTimeout(async () => {
            try {
                await channel.delete();
            } catch (error) {
                console.error('Failed to delete ticket channel:', error);
            }
        }, 10000); // 10 second delay
    }

    async handleTicketResolve(interaction, user, channel) {
        // Similar to close but marks as resolved
        await this.handleTicketClose(interaction, user, channel);
    }

    checkTicketActivity(message) {
        if (!this.isTicketChannel(message.channel)) return;

        const channel = message.channel;
        const user = message.author;

        // Track first response time for staff
        if (this.hasPermission(message.member)) {
            const ticket = this.activeTickets.get(channel.id);
            if (ticket && !ticket.firstResponse) {
                ticket.firstResponse = Date.now();
                ticket.firstResponder = user.id;
                this.activeTickets.set(channel.id, ticket);

                // Update response time stats
                if (ticket.claimTime) {
                    const responseTime = Date.now() - ticket.claimTime;
                    const stats = this.ticketStats.get(user.id) || { claimed: 0, closed: 0, responseTime: [] };
                    stats.responseTime.push(responseTime);
                    this.ticketStats.set(user.id, stats);
                }
            }
        }
    }

    handleTicketClosure(channel) {
        const ticket = this.activeTickets.get(channel.id);
        if (!ticket) return;

        // If ticket was closed without going through the button, still update stats
        if (ticket.claimedBy) {
            const stats = this.ticketStats.get(ticket.claimedBy) || { claimed: 0, closed: 0, responseTime: [] };
            stats.closed++;
            
            if (ticket.claimTime) {
                const responseTime = Date.now() - ticket.claimTime;
                stats.responseTime.push(responseTime);
            }
            
            this.ticketStats.set(ticket.claimedBy, stats);
        }

        this.activeTickets.delete(channel.id);
    }

    // Complete Ticket System Implementation
    async createTicket(interaction) {
        const { user } = interaction;

        try {
            // Check if user already has too many tickets
            const userTickets = Array.from(this.activeTickets.values())
                .filter(ticket => ticket.creator === user.id).length;
            
            if (userTickets >= config.ticketSystem.maxTicketsPerUser) {
                return interaction.reply({
                    content: `❌ You already have ${userTickets} active tickets! Please close existing tickets before creating new ones.`,
                    ephemeral: true
                });
            }

            // Show modal for ticket creation
            const modal = new ModalBuilder()
                .setCustomId('ticket_modal')
                .setTitle('🎫 Create Support Ticket');

            const subjectInput = new TextInputBuilder()
                .setCustomId('ticket_subject')
                .setLabel('What do you need help with?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Brief description of your issue...')
                .setRequired(true)
                .setMaxLength(100);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('ticket_description')
                .setLabel('Detailed Description')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Please provide more details about your issue...')
                .setRequired(true)
                .setMaxLength(1000);

            const priorityInput = new TextInputBuilder()
                .setCustomId('ticket_priority')
                .setLabel('Priority (high/medium/low)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('medium')
                .setRequired(false)
                .setMaxLength(10);

            const firstActionRow = new ActionRowBuilder().addComponents(subjectInput);
            const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(priorityInput);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            await interaction.showModal(modal);

        } catch (error) {
            await interaction.reply({
                content: '❌ Something went wrong while creating your ticket. Please try again.',
                ephemeral: true
            });
        }
    }

    async createTicketFromModal(interaction, subject, description, priority = 'medium') {
        const { user, guild } = interaction;

        try {
            // Find or create ticket category
            let category = guild.channels.cache.get(config.ticketSystem.categoryId);
            if (!category) {
                category = await guild.channels.create({
                    name: '🎫 Support Tickets',
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        ...config.ticketSystem.staffRoleIds.map(roleId => ({
                            id: roleId,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ManageMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }))
                    ]
                });
                // Update config with new category ID
                config.ticketSystem.categoryId = category.id;
            }

            // Generate unique ticket number
            const ticketNumber = Date.now().toString().slice(-6);
            const channelName = `ticket-${user.username}-${ticketNumber}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

            // Create ticket channel
            const staffRoles = this.getStaffRoles(guild);
            const ticketChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles
                        ]
                    },
                    // Add permissions for all staff roles (configured + Admin/Discord Moderator)
                    ...staffRoles.map(role => ({
                        id: role.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles
                        ]
                    }))
                ]
            });

            // Store ticket data
            this.activeTickets.set(ticketChannel.id, {
                creator: user.id,
                subject: subject,
                description: description,
                priority: priority,
                createdAt: Date.now(),
                claimedBy: null,
                claimTime: null,
                status: 'open'
            });

            // Get priority config
            const priorityConfig = config.ticketSystem.priorities[priority];

            // Create ticket embed
            const ticketEmbed = new EmbedBuilder()
                .setTitle(`${priorityConfig.emoji} NEW SUPPORT TICKET #${ticketNumber}`)
                .setDescription(`**Subject:** ${subject}\n**Priority:** ${priorityConfig.emoji} ${priority.toUpperCase()}\n**Created by:** ${user.toString()}`)
                .setColor(priorityConfig.color)
                .addFields(
                    { name: '📋 Instructions', value: 'Please describe your issue in detail below. A staff member will assist you shortly!', inline: false },
                    { name: '⏰ Created', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '🏷️ Ticket ID', value: `#${ticketNumber}`, inline: true },
                    { name: '📊 Status', value: '🟡 Waiting for staff', inline: true }
                )
                .setFooter({ text: 'Guardian Bot Ticket System - Premium Support! 🏆' })
                .setTimestamp();

            // Create action buttons
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`claim_ticket_${ticketChannel.id}`)
                        .setLabel('Claim Ticket')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('👨‍💼'),
                    new ButtonBuilder()
                        .setCustomId(`close_ticket_${ticketChannel.id}`)
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒'),
                    new ButtonBuilder()
                        .setCustomId(`delete_ticket_${ticketChannel.id}`)
                        .setLabel('Delete Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🗑️'),
                    new ButtonBuilder()
                        .setCustomId(`transcript_ticket_${ticketChannel.id}`)
                        .setLabel('Generate Transcript')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📄')
                );

            // Get Admin and Discord Moderator roles for tagging
            const adminRole = guild.roles.cache.find(role => role.name === 'Admin');
            const modRole = guild.roles.cache.find(role => role.name === 'Discord Moderator');
            
            // Build role mentions array
            let roleMentions = [];
            
            // Add configured priority ping roles
            if (priorityConfig.pingRoles.length > 0) {
                roleMentions.push(...priorityConfig.pingRoles.map(id => `<@&${id}>`));
            }
            
            // Always add Admin and Discord Moderator roles if they exist
            if (adminRole) {
                roleMentions.push(`<@&${adminRole.id}>`);
            }
            if (modRole) {
                roleMentions.push(`<@&${modRole.id}>`);
            }

            // Send initial message in ticket
            const welcomeMessage = await ticketChannel.send({
                content: roleMentions.length > 0 ? `🚨 **NEW TICKET ALERT!** ${roleMentions.join(' ')}\n\n**A new support ticket requires staff attention!**` : '',
                embeds: [ticketEmbed],
                components: [actionRow]
            });

            // Pin the welcome message
            await welcomeMessage.pin();

            // Send additional staff notification message if roles exist
            if (adminRole || modRole) {
                const staffNotificationEmbed = new EmbedBuilder()
                    .setTitle('🔔 STAFF NOTIFICATION')
                    .setDescription(`**NEW TICKET REQUIRES ATTENTION!**\n\n${user.toString()} has created a **${priorityConfig.emoji} ${priority.toUpperCase()} PRIORITY** ticket!\n\n**Subject:** ${subject}\n**Response Time Goal:** ${priorityConfig.emoji === '🔴' ? '< 30 minutes' : priorityConfig.emoji === '🟡' ? '< 2 hours' : '< 24 hours'}`)
                    .setColor(priorityConfig.color)
                    .addFields(
                        { name: '👤 Created By', value: user.toString(), inline: true },
                        { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        { name: '🎯 Action Needed', value: 'Click **Claim Ticket** button above!', inline: true }
                    )
                    .setFooter({ text: 'Staff - Please respond promptly! 🚀' })
                    .setTimestamp();

                const staffPings = [];
                if (adminRole) staffPings.push(`<@&${adminRole.id}>`);
                if (modRole) staffPings.push(`<@&${modRole.id}>`);

                await ticketChannel.send({
                    content: `🚨 ${staffPings.join(' ')} - **IMMEDIATE ATTENTION REQUIRED!**`,
                    embeds: [staffNotificationEmbed]
                });
            }

            const trumpResponse = this.getTrumpResponse('generalResponses', { user: user.toString() });

            // Reply to user
            await interaction.reply({
                content: `✅ **TREMENDOUS!** Your support ticket has been created!\n\n${trumpResponse}\n\n**Ticket:** ${ticketChannel.toString()}\n**Subject:** ${subject}\n**Priority:** ${priorityConfig.emoji} ${priority.toUpperCase()}`,
                ephemeral: true
            });

            // Log ticket creation
            const staffRoleNames = [];
            if (adminRole) staffRoleNames.push('Admin');
            if (modRole) staffRoleNames.push('Discord Moderator');
            const staffNotification = staffRoleNames.length > 0 ? ` - Staff notified: ${staffRoleNames.join(', ')}` : '';
            
            await this.logEvent(guild, 'Ticket Created', 
                `${user.tag} created ticket ${ticketChannel.name} - Subject: ${subject} - Priority: ${priority}${staffNotification}`, 
                priorityConfig.color);

        } catch (error) {
            await interaction.reply({
                content: `❌ Failed to create ticket: ${error.message}`,
                ephemeral: true
            });
        }
    }

    async claimTicket(interaction) {
        const { user, guild, channel, options } = interaction;
        
        if (!this.hasPermission(interaction.member)) {
            return interaction.reply({
                content: '❌ Only staff members can claim tickets!',
                ephemeral: true
            });
        }

        if (!this.isTicketChannel(channel)) {
            return interaction.reply({
                content: '❌ This command can only be used in ticket channels!',
                ephemeral: true
            });
        }

        const ticket = this.activeTickets.get(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ No ticket data found for this channel!',
                ephemeral: true
            });
        }

        if (ticket.claimedBy) {
            const claimedUser = await guild.members.fetch(ticket.claimedBy).catch(() => null);
            return interaction.reply({
                content: `❌ This ticket is already claimed by ${claimedUser ? claimedUser.user.tag : 'someone'}!`,
                ephemeral: true
            });
        }

        // Check if assigning to someone else
        const assignTo = options.getUser('assign-to');
        const targetUser = assignTo || user;
        
        if (assignTo && !this.hasPermission(await guild.members.fetch(assignTo.id))) {
            return interaction.reply({
                content: '❌ You can only assign tickets to staff members!',
                ephemeral: true
            });
        }

        // Update ticket data
        ticket.claimedBy = targetUser.id;
        ticket.claimTime = Date.now();
        ticket.status = 'claimed';
        this.activeTickets.set(channel.id, ticket);

        // Update stats
        const stats = this.ticketStats.get(targetUser.id) || { claimed: 0, closed: 0, responseTime: [] };
        stats.claimed++;
        this.ticketStats.set(targetUser.id, stats);

        const trumpResponse = this.getTrumpResponse('generalResponses', { user: targetUser.toString() });

        // Create claim embed
        const claimEmbed = new EmbedBuilder()
            .setTitle('🎫 TICKET CLAIMED!')
            .setDescription(`**${targetUser.tag} has claimed this ticket!**\n\n${trumpResponse}`)
            .setColor(0x00ff00)
            .addFields(
                { name: '👨‍💼 Claimed By', value: targetUser.toString(), inline: true },
                { name: '⏰ Claim Time', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                { name: '📊 Total Claims', value: `${stats.claimed}`, inline: true },
                { name: '📋 Next Steps', value: 'The assigned staff member will help resolve your issue!', inline: false }
            )
            .setFooter({ text: 'Guardian Bot Ticket System - Making Support Great Again! 🇺🇸' })
            .setTimestamp();

        await interaction.reply({ embeds: [claimEmbed] });

        // Update channel topic
        await channel.setTopic(`🎫 Claimed by ${targetUser.tag} | Created: <t:${Math.floor(ticket.createdAt / 1000)}:R>`);

        await this.logEvent(guild, 'Ticket Claimed',
            `${user.tag} ${assignTo ? `assigned ticket to ${targetUser.tag}` : 'claimed ticket'} in ${channel.name} - Total claims: ${stats.claimed}`, 0x00ff00);
    }

    async closeTicket(interaction) {
        const { user, guild, channel, options } = interaction;
        
        if (!this.hasPermission(interaction.member)) {
            const ticket = this.activeTickets.get(channel.id);
            if (!ticket || ticket.creator !== user.id) {
                return interaction.reply({
                    content: '❌ Only staff members or the ticket creator can close tickets!',
                    ephemeral: true
                });
            }
        }

        if (!this.isTicketChannel(channel)) {
            return interaction.reply({
                content: '❌ This command can only be used in ticket channels!',
                ephemeral: true
            });
        }

        const ticket = this.activeTickets.get(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ No ticket data found for this channel!',
                ephemeral: true
            });
        }

        const reason = options.getString('reason') || 'No reason provided';

        // Calculate resolution time
        let resolutionTime = 0;
        if (ticket.claimTime) {
            resolutionTime = Date.now() - ticket.claimTime;
        }

        // Update stats for the closer
        if (this.hasPermission(interaction.member)) {
            const stats = this.ticketStats.get(user.id) || { claimed: 0, closed: 0, responseTime: [] };
            stats.closed++;
            if (resolutionTime > 0) {
                stats.responseTime.push(resolutionTime);
            }
            this.ticketStats.set(user.id, stats);
        }

        const trumpResponse = this.getTrumpResponse('generalResponses', { user: user.toString() });

        // Create closure embed
        const closeEmbed = new EmbedBuilder()
            .setTitle('🎫 TICKET CLOSED!')
            .setDescription(`**This ticket has been closed by ${user.tag}**\n\n${trumpResponse}`)
            .setColor(0xff6600)
            .addFields(
                { name: '🔒 Closed By', value: user.toString(), inline: true },
                { name: '⏱️ Resolution Time', value: resolutionTime > 0 ? `${Math.round(resolutionTime / 60000)} minutes` : 'N/A', inline: true },
                { name: '📝 Reason', value: reason, inline: false },
                { name: '⏰ Closed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setFooter({ text: 'Guardian Bot Ticket System - Tremendous Support! 🏆' })
            .setTimestamp();

        await interaction.reply({ embeds: [closeEmbed] });

        // Wait a moment then close the channel
        setTimeout(async () => {
            try {
                // Generate transcript if configured
                await this.generateTranscript(channel, ticket, user, reason);
                
                // Remove from active tickets
                this.activeTickets.delete(channel.id);
                
                // Delete the channel
                await channel.delete('Ticket closed');
            } catch (error) {
                // Channel might already be deleted
            }
        }, 5000);

        await this.logEvent(guild, 'Ticket Closed',
            `${user.tag} closed ticket ${channel.name} - Reason: ${reason}`, 0xff6600);
    }

    async deleteTicket(interaction) {
        const { user, guild, channel, options } = interaction;
        
        if (!this.hasPermission(interaction.member)) {
            return interaction.reply({
                content: '❌ Only staff members can delete tickets!',
                ephemeral: true
            });
        }

        if (!this.isTicketChannel(channel)) {
            return interaction.reply({
                content: '❌ This command can only be used in ticket channels!',
                ephemeral: true
            });
        }

        const ticket = this.activeTickets.get(channel.id);
        if (!ticket) {
            return interaction.reply({
                content: '❌ No ticket data found for this channel!',
                ephemeral: true
            });
        }

        const reason = options.getString('reason') || 'No reason provided';

        // Get staff type for display
        const staffType = this.getStaffType(interaction.member);

        // Calculate resolution time
        let resolutionTime = 0;
        if (ticket.claimTime) {
            resolutionTime = Date.now() - ticket.claimTime;
        }

        // Update stats for the deleter
        const stats = this.ticketStats.get(user.id) || { claimed: 0, closed: 0, responseTime: [], deleted: 0 };
        stats.deleted = (stats.deleted || 0) + 1;
        if (resolutionTime > 0) {
            stats.responseTime.push(resolutionTime);
        }
        this.ticketStats.set(user.id, stats);

        const trumpResponse = this.getTrumpResponse('generalResponses', { user: user.toString() });

        // Create deletion embed
        const deleteEmbed = new EmbedBuilder()
            .setTitle('🗑️ TICKET DELETED!')
            .setDescription(`**This ticket has been PERMANENTLY DELETED by ${user.tag}**\n\n${trumpResponse}\n\n⚠️ **Channel will be deleted in 10 seconds!**`)
            .setColor(0x8B0000)
            .addFields(
                { name: '🗑️ Deleted By', value: `${user.toString()}\n${staffType}`, inline: true },
                { name: '⏱️ Resolution Time', value: resolutionTime > 0 ? `${Math.round(resolutionTime / 60000)} minutes` : 'N/A', inline: true },
                { name: '📝 Reason', value: reason, inline: false },
                { name: '⏰ Deleted At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📊 Total Deleted', value: `${stats.deleted}`, inline: true }
            )
            .setFooter({ text: 'Guardian Bot Ticket System - PERMANENTLY DELETED! 🗑️' })
            .setTimestamp();

        await interaction.reply({ embeds: [deleteEmbed] });

        // Wait a moment then delete the channel permanently
        setTimeout(async () => {
            try {
                // Remove from active tickets first
                this.activeTickets.delete(channel.id);
                
                // Delete the channel immediately (no transcript for deleted tickets)
                await channel.delete('Ticket deleted by staff');
            } catch (error) {
                // Channel might already be deleted
            }
        }, 10000); // 10 second delay to let users see the message

        await this.logEvent(guild, 'Ticket Deleted',
            `${staffType} ${user.tag} DELETED ticket ${channel.name} - Reason: ${reason}`, 0x8B0000);
    }

    async generateTranscript(channel, ticket, closedBy, reason) {
        if (!config.ticketSystem.transcriptChannelId) return;

        try {
            const transcriptChannel = channel.guild.channels.cache.get(config.ticketSystem.transcriptChannelId);
            if (!transcriptChannel) return;

            // Fetch all messages in the ticket
            const messages = [];
            let lastMessageId;
            
            while (true) {
                const options = { limit: 100 };
                if (lastMessageId) options.before = lastMessageId;
                
                const batch = await channel.messages.fetch(options);
                if (batch.size === 0) break;
                
                messages.push(...batch.values());
                lastMessageId = batch.last().id;
            }

            messages.reverse(); // Chronological order

            // Create transcript text
            let transcript = `TICKET TRANSCRIPT\n`;
            transcript += `=================\n`;
            transcript += `Ticket: ${channel.name}\n`;
            transcript += `Creator: ${ticket.creator}\n`;
            transcript += `Created: ${new Date(ticket.createdAt).toLocaleString()}\n`;
            transcript += `Closed by: ${closedBy.tag}\n`;
            transcript += `Closed: ${new Date().toLocaleString()}\n`;
            transcript += `Reason: ${reason}\n`;
            transcript += `=================\n\n`;

            for (const message of messages) {
                if (message.author.bot && message.embeds.length > 0) continue; // Skip bot embeds
                transcript += `[${message.createdAt.toLocaleString()}] ${message.author.tag}: ${message.content}\n`;
                
                if (message.attachments.size > 0) {
                    message.attachments.forEach(attachment => {
                        transcript += `  📎 Attachment: ${attachment.name} (${attachment.url})\n`;
                    });
                }
            }

            // Save transcript as file and send
            const fs = require('fs');
            const fileName = `transcript-${channel.name}-${Date.now()}.txt`;
            const filePath = `./${fileName}`;
            
            fs.writeFileSync(filePath, transcript);

            const transcriptEmbed = new EmbedBuilder()
                .setTitle('📄 TICKET TRANSCRIPT')
                .setDescription(`Transcript for ticket **${channel.name}**`)
                .addFields(
                    { name: '🆔 Ticket', value: channel.name, inline: true },
                    { name: '👤 Creator', value: `<@${ticket.creator}>`, inline: true },
                    { name: '🔒 Closed By', value: closedBy.toString(), inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setColor(0x0099ff)
                .setTimestamp();

            await transcriptChannel.send({
                embeds: [transcriptEmbed],
                files: [{ attachment: filePath, name: fileName }]
            });

            // Clean up file
            fs.unlinkSync(filePath);
        } catch (error) {
            // Transcript generation failed, but don't block ticket closure
        }
    }

    async createTicketPanel(interaction) {
        if (!config.ownerIds.includes(interaction.user.id) && !this.hasPermission(interaction.member)) {
            return interaction.reply({
                content: '❌ Only administrators can create ticket panels!',
                ephemeral: true
            });
        }

        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

        const panelEmbed = new EmbedBuilder()
            .setTitle('🎫 SUPPORT TICKET SYSTEM')
            .setDescription(`**Need help? Create a support ticket!**\n\nOur amazing staff team is here to help you with any questions or issues you might have. Click the button below to create a new support ticket.\n\n**What to include:**\n• Clear description of your issue\n• Any relevant screenshots\n• Steps you've already tried\n\n**Response Times:**\n🔴 High Priority: < 30 minutes\n🟡 Medium Priority: < 2 hours\n🟢 Low Priority: < 24 hours`)
            .setColor(0x0099ff)
            .addFields(
                { name: '📋 How it works', value: '1️⃣ Click "Create Ticket"\n2️⃣ Describe your issue\n3️⃣ Wait for staff response\n4️⃣ Get your problem solved!', inline: true },
                { name: '📊 Support Hours', value: 'We provide 24/7 support!\nStaff are always available to help.', inline: true },
                { name: '🏆 Premium Support', value: 'Fast, professional, and friendly assistance guaranteed!', inline: false }
            )
            .setFooter({ text: 'Guardian Bot Ticket System - Making Support Great Again! 🇺🇸' })
            .setTimestamp();

        const panelButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket_panel')
                    .setLabel('Create Support Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );

        await targetChannel.send({
            embeds: [panelEmbed],
            components: [panelButton]
        });

        await interaction.reply({
            content: `✅ Ticket panel created successfully in ${targetChannel.toString()}!`,
            ephemeral: true
        });
    }

    // Skeeter Protection System
    async checkSkeeterProtection(guild, targetUser, actionType) {
        // Check if the target is Skeeter (by ID or username)
        const skeeterIds = config.ownerIds || [];
        const isSkeeterTarget = skeeterIds.includes(targetUser.id) || 
                              targetUser.username.toLowerCase().includes('skeeter') ||
                              targetUser.displayName?.toLowerCase().includes('skeeter');

        if (!isSkeeterTarget) return;

        // Get the audit log to find who performed the action
        try {
            const auditType = {
                'ban': 22, // MEMBER_BAN_ADD
                'kick': 20, // MEMBER_KICK  
                'timeout': 24 // MEMBER_UPDATE (for timeouts)
            };

            const auditLogs = await guild.fetchAuditLogs({ 
                limit: 1, 
                type: auditType[actionType] 
            });
            
            const auditEntry = auditLogs.entries.first();
            if (!auditEntry || !auditEntry.executor) return;

            const adminId = auditEntry.executor.id;
            const admin = await guild.members.fetch(adminId).catch(() => null);
            
            if (!admin || admin.user.bot) return; // Don't target bots or if admin not found

            // Track warnings for this admin
            const currentWarnings = this.skeeterProtection.get(adminId) || 0;
            const trumpTrashTalk = this.getTrumpResponse('aggressiveResponses', { 
                user: admin.user.tag 
            });

            if (currentWarnings === 0) {
                // First warning - aggressive Trump style
                this.skeeterProtection.set(adminId, 1);
                
                const warningEmbed = new EmbedBuilder()
                    .setTitle('🚨 SKEETER PROTECTION VIOLATION!')
                    .setDescription(`**${admin.user.tag} tried to ${actionType.toUpperCase()} SKEETER!**\n\n**ONE MORE FALSE MOVE AND YOU'RE BANNED, FUCKER!**`)
                    .setColor(0xff0000)
                    .addFields(
                        { name: '⚠️ TRUMP WARNING', value: `${trumpTrashTalk}`, inline: false },
                        { name: '🎯 Action Detected', value: `Attempted ${actionType} on Skeeter`, inline: true },
                        { name: '💀 Next Violation', value: 'INSTANT ROLE REMOVAL + BAN', inline: true },
                        { name: '🛡️ Protection Level', value: 'MAXIMUM SECURITY ENGAGED', inline: false }
                    )
                    .setFooter({ text: 'DON\'T FUCK WITH SKEETER! 🔥' })
                    .setTimestamp();

                await this.sendToLogChannel(guild, warningEmbed);

                // Send aggressive DM to the admin
                try {
                    await admin.send(`🚨 **WARNING YOU PIECE OF SHIT!** 🚨\n\nYou just tried to ${actionType} Skeeter! **ONE MORE FALSE MOVE AND YOU'RE BANNED, FUCKER!**\n\nDon't test me - I'm watching your every move now! 👁️`);
                } catch (error) {
                    console.log('Could not DM admin Skeeter protection warning');
                }

            } else {
                // Second violation - DESTROY THEM
                const destroyTrashTalk = this.getTrumpResponse('aggressiveResponses', { 
                    user: admin.user.tag 
                });
                
                const executionEmbed = new EmbedBuilder()
                    .setTitle('💀 SKEETER PROTECTION EXECUTED!')
                    .setDescription(`**${admin.user.tag} VIOLATED SKEETER PROTECTION TWICE!**\n\n**YOU'RE FUCKING DONE! ROLES REMOVED!**`)
                    .setColor(0x000000)
                    .addFields(
                        { name: '🔥 TRUMP EXECUTION', value: `${destroyTrashTalk}`, inline: false },
                        { name: '⚰️ Violations', value: `1st: Warning\n2nd: **DESTRUCTION**`, inline: true },
                        { name: '💥 Actions Taken', value: 'ALL ADMIN ROLES REMOVED', inline: true },
                        { name: '🎯 Final Message', value: 'DON\'T FUCK WITH SKEETER!', inline: false }
                    )
                    .setFooter({ text: 'SKEETER PROTECTION: MAXIMUM ENFORCEMENT 💀' })
                    .setTimestamp();

                await this.sendToLogChannel(guild, executionEmbed);

                // Remove ALL their admin roles
                const adminRoles = admin.roles.cache.filter(role => 
                    role.permissions.has(PermissionFlagsBits.Administrator) ||
                    role.permissions.has(PermissionFlagsBits.BanMembers) ||
                    role.permissions.has(PermissionFlagsBits.KickMembers) ||
                    role.permissions.has(PermissionFlagsBits.ManageRoles) ||
                    role.permissions.has(PermissionFlagsBits.ManageChannels) ||
                    role.permissions.has(PermissionFlagsBits.ManageGuild)
                );

                for (const [, role] of adminRoles) {
                    try {
                        await admin.roles.remove(role, `SKEETER PROTECTION: Violated protection twice - YOU'RE FUCKING DONE! 💀`);
                    } catch (error) {
                        console.error(`Failed to remove role ${role.name}:`, error);
                    }
                }

                // Send final destruction message
                try {
                    await admin.send(`💀 **YOU'RE FUCKING DONE!** 💀\n\nYou violated Skeeter protection TWICE! All your admin roles have been REMOVED!\n\n**DON'T FUCK WITH SKEETER!** 🔥\n\nYou played yourself, asshole! 🤡`);
                } catch (error) {
                    console.log('Could not DM admin destruction message');
                }

                // Reset counter after punishment
                this.skeeterProtection.set(adminId, 0);
            }

        } catch (error) {
            console.error('Error in Skeeter protection:', error);
        }
    }

    // Admin Monitoring System
    async handleAdminAction(guild, actionType) {
        if (!config.adminMonitoring.enabled) return;

        // This is a simplified version - in practice, you'd need to check audit logs
        // to identify which admin performed the action
        const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: actionType === 'ban' ? 22 : 20 });
        const auditEntry = auditLogs.entries.first();
        
        if (!auditEntry || !auditEntry.executor) return;

        const adminId = auditEntry.executor.id;
        const now = Date.now();

        if (!this.adminActions.has(adminId)) {
            this.adminActions.set(adminId, []);
        }

        const actions = this.adminActions.get(adminId);
        actions.push(now);

        // Clean old entries
        const validActions = actions.filter(time => now - time < config.adminMonitoring.timeWindow);
        this.adminActions.set(adminId, validActions);

        if (validActions.length >= config.adminMonitoring.actionThreshold) {
            await this.handleRogueAdmin(guild, adminId, validActions.length);
        }
    }

    async handleRogueAdmin(guild, adminId, actionCount) {
        const admin = await guild.members.fetch(adminId).catch(() => null);
        if (!admin) return;

        const warningCount = this.adminWarnings.get(adminId) || 0;
        const trumpTrashTalk = this.getTrumpResponse('rogueAdmin', { 
            admin: admin.user.tag, 
            actions: actionCount 
        });

        if (warningCount === 0 && config.adminMonitoring.warningEnabled) {
            // First warning with Trump-style roast
            this.adminWarnings.set(adminId, 1);
            
            const embed = new EmbedBuilder()
                .setTitle('⚠️ ADMIN WARNING')
                .setDescription(`**${trumpTrashTalk}**`)
                .setColor(0xffa500)
                .addFields(
                    { name: '🎯 TRUMP SAYS', value: 'This admin is having a total meltdown! Sad!', inline: false },
                    { name: '📊 Action Count', value: `${actionCount} actions in ${config.adminMonitoring.timeWindow/60000} minutes`, inline: false }
                )
                .setFooter({ text: 'First warning - You\'re on thin ice! ❄️' })
                .setTimestamp();

            await this.sendToLogChannel(guild, embed);

            try {
                await admin.send(`**TRUMP WARNING**: ${trumpTrashTalk}\n\nSlow down or you're FIRED! 🔥`);
            } catch (error) {
                console.log('Could not DM admin warning');
            }

        } else if (warningCount >= 1) {
            // Take action against rogue admin with Trump-style firing
            const firingTrashTalk = this.getTrumpResponse('rogueAdmin', { 
                admin: admin.user.tag, 
                actions: actionCount 
            });
            
            const embed = new EmbedBuilder()
                .setTitle('🚨 ROGUE ADMIN DETECTED')
                .setDescription(`**${firingTrashTalk}**\n\n**YOU'RE FIRED! 🔥**`)
                .setColor(0xff0000)
                .addFields(
                    { name: '🎯 TRUMP SAYS', value: 'This admin is a complete disaster! FIRED!', inline: false },
                    { name: '⚖️ Action Taken', value: 'Removing all administrative powers immediately!', inline: false }
                )
                .setFooter({ text: 'Make Admins Great Again! 🇺🇸' })
                .setTimestamp();

            await this.sendToLogChannel(guild, embed);

            if (config.adminMonitoring.autoRemoveRoles) {
                // Remove admin roles
                const adminRoles = admin.roles.cache.filter(role => 
                    role.permissions.has(PermissionFlagsBits.Administrator) ||
                    role.permissions.has(PermissionFlagsBits.BanMembers) ||
                    role.permissions.has(PermissionFlagsBits.KickMembers)
                );

                for (const [, role] of adminRoles) {
                    try {
                        await admin.roles.remove(role, 'TRUMP AUTO-REMOVAL: Rogue admin behavior - YOU\'RE FIRED! 🔥');
                    } catch (error) {
                        console.error(`Failed to remove role ${role.name}:`, error);
                    }
                }
            }

            if (config.adminMonitoring.autoBan && admin.bannable) {
                try {
                    await admin.ban({ reason: 'TRUMP AUTO-BAN: Rogue admin behavior - YOU\'RE FIRED PERMANENTLY! 🔥' });
                } catch (error) {
                    console.error(`Failed to ban rogue admin:`, error);
                }
            }
        }
    }

    // Lockdown System
    async lockdownServer(guild, reason = 'Manual lockdown') {
        if (this.lockdownStatus.get(guild.id)) return; // Already locked down

        this.lockdownStatus.set(guild.id, true);
        const trumpLockdown = this.getTrumpResponse('lockdown');

        // Store original permissions for restoration
        if (!this.originalPermissions) {
            this.originalPermissions = new Map();
        }

        const embed = new EmbedBuilder()
            .setTitle('🔒 SERVER LOCKDOWN ACTIVATED')
            .setDescription(`**${trumpLockdown}**\n\n**Reason:** ${reason}`)
            .setColor(0xff0000)
            .addFields(
                { name: '🎯 TRUMP SAYS', value: 'This server is now MORE SECURE than Fort Knox!', inline: false },
                { name: '🛡️ Security Status', value: 'ALL channels locked down for maximum protection!', inline: false }
            )
            .setFooter({ text: 'Make Discord Great Again! 🇺🇸' })
            .setTimestamp();

        await this.sendToLogChannel(guild, embed);

        // Lock down all channels
        for (const [, channel] of guild.channels.cache) {
            if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
                try {
                    // Store original @everyone permissions for this channel
                    const everyoneOverwrite = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
                    this.originalPermissions.set(`${guild.id}_${channel.id}`, {
                        SendMessages: everyoneOverwrite?.allow?.has('SendMessages') ?? null,
                        AddReactions: everyoneOverwrite?.allow?.has('AddReactions') ?? null,
                        Connect: everyoneOverwrite?.allow?.has('Connect') ?? null,
                        SendMessagesInThreads: everyoneOverwrite?.allow?.has('SendMessagesInThreads') ?? null
                    });

                    // Apply lockdown restrictions - only modify specific permissions
                    await channel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: false,
                        AddReactions: false,
                        Connect: false,
                        SendMessagesInThreads: false
                    });
                } catch (error) {
                    console.error(`Failed to lock channel ${channel.name}:`, error);
                }
            }
        }
    }

    async unlockServer(guild, reason = 'Manual unlock') {
        if (!this.lockdownStatus.get(guild.id)) return; // Not locked down

        this.lockdownStatus.set(guild.id, false);

        const embed = new EmbedBuilder()
            .setTitle('🔓 SERVER LOCKDOWN LIFTED')
            .setDescription(`**The BEST unlock ever! This server is now open for business again!**\n\n**Reason:** ${reason}`)
            .setColor(0x00ff00)
            .addFields(
                { name: '🎯 TRUMP SAYS', value: 'We\'re open again, and we\'re WINNING!', inline: false },
                { name: '✅ Status Update', value: 'Normal operations resumed - tremendous success!', inline: false }
            )
            .setFooter({ text: 'America... I mean, Discord is Great Again! 🇺🇸' })
            .setTimestamp();

        await this.sendToLogChannel(guild, embed);

        // Restore original permissions for all channels
        for (const [, channel] of guild.channels.cache) {
            if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
                try {
                    const originalPerms = this.originalPermissions?.get(`${guild.id}_${channel.id}`);
                    
                    if (originalPerms) {
                        // Restore only the permissions we modified, preserving existing overwrites
                        const restorePerms = {};
                        
                        // Only restore if the permission was explicitly set before
                        if (originalPerms.SendMessages !== null) {
                            restorePerms.SendMessages = originalPerms.SendMessages;
                        } else {
                            restorePerms.SendMessages = null; // Remove our restriction
                        }
                        
                        if (originalPerms.AddReactions !== null) {
                            restorePerms.AddReactions = originalPerms.AddReactions;
                        } else {
                            restorePerms.AddReactions = null;
                        }
                        
                        if (originalPerms.Connect !== null) {
                            restorePerms.Connect = originalPerms.Connect;
                        } else {
                            restorePerms.Connect = null;
                        }
                        
                        if (originalPerms.SendMessagesInThreads !== null) {
                            restorePerms.SendMessagesInThreads = originalPerms.SendMessagesInThreads;
                        } else {
                            restorePerms.SendMessagesInThreads = null;
                        }

                        await channel.permissionOverwrites.edit(guild.roles.everyone, restorePerms);
                        
                        // Clean up stored permissions
                        this.originalPermissions.delete(`${guild.id}_${channel.id}`);
                    } else {
                        // Fallback: just remove the restrictions we added (safer than deleting all overwrites)
                        await channel.permissionOverwrites.edit(guild.roles.everyone, {
                            SendMessages: null,
                            AddReactions: null,
                            Connect: null,
                            SendMessagesInThreads: null
                        });
                    }
                } catch (error) {
                    console.error(`Failed to unlock channel ${channel.name}:`, error);
                }
            }
        }
    }

    // Bot mention detection and handling
    checkBotMention(message) {
        // Check if the bot is mentioned directly
        const isBotMentioned = message.mentions.users.has(this.client.user.id);
        
        // Check if it's a reply to the bot
        const isReplyToBot = message.reference && 
            message.channel.messages.cache.get(message.reference.messageId)?.author.id === this.client.user.id;
        
        return isBotMentioned || isReplyToBot;
    }

    async handleBotMention(message) {
        const user = message.author;
        
        // Determine response type based on message content and user behavior
        let responseCategory = 'botMentions';
        const content = message.content.toLowerCase();
        
        // Check for aggressive/negative content to respond with trash talk
        if (content.includes('fuck') || content.includes('shit') || content.includes('damn') || 
            content.includes('stupid') || content.includes('dumb') || content.includes('hate') ||
            content.includes('suck') || content.includes('trash') || content.includes('bad')) {
            responseCategory = 'aggressiveResponses';
        }
        // Check for specific keywords to give more contextual responses
        else if (content.includes('help') || content.includes('command')) {
            responseCategory = 'generalResponses';
        } else if (content.includes('status') || content.includes('working')) {
            responseCategory = 'generalResponses';
        } else if (content.includes('thank') || content.includes('good') || content.includes('great')) {
            responseCategory = 'generalResponses';
        }
        
        const trumpResponse = this.getTrumpResponse(responseCategory, { user: user.toString() });
        
        // Create response embed
        const responseEmbed = new EmbedBuilder()
            .setTitle('🤖 TRUMP BOT RESPONSE')
            .setDescription(`**${trumpResponse}**`)
            .setColor(responseCategory === 'aggressiveResponses' ? 0xff0000 : 0x4f46e5)
            .setThumbnail(this.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '🎯 TRUMP SAYS', 
                    value: responseCategory === 'aggressiveResponses' ? 
                        'You\'re messing with the WRONG bot, asshole!' : 
                        'You\'re talking to the BEST bot in Discord!', 
                    inline: false 
                },
                { name: '🛡️ Guardian Status', value: 'Making Discord Great Again, 24/7!', inline: false }
            )
            .setFooter({ text: 'Guardian Bot created by Skeeter - Make Discord Great Again! 🇺🇸' })
            .setTimestamp();

        // Random chance for additional Trump catchphrases
        const aggressiveCatchphrases = [
            "GET REKT! 💀",
            "YOU'RE FIRED! 🔥", 
            "OWNED! 💥",
            "SIT DOWN! 🪑",
            "DESTROYED! ⚡"
        ];
        
        const normalCatchphrases = [
            "WINNING! 🏆",
            "TREMENDOUS! 💪", 
            "HUGE SUCCESS! 📈",
            "THE BEST! ⭐",
            "PHENOMENAL! 🌟"
        ];
        
        const catchphrases = responseCategory === 'aggressiveResponses' ? aggressiveCatchphrases : normalCatchphrases;
        const extraPhrase = Math.random() < 0.4 ? 
            `\n\n**${catchphrases[Math.floor(Math.random() * catchphrases.length)]}**` : '';

        // Send the Trump response
        await message.reply({ 
            content: `🤖 **${trumpResponse}** ${extraPhrase}`,
            embeds: [responseEmbed]
        });

        // Log the bot interaction
        const logType = responseCategory === 'aggressiveResponses' ? 'Trump Bot DESTROYED User' : 'Trump Bot Interaction';
        await this.logEvent(message.guild, logType, 
            `${user.tag} mentioned the bot and got ${responseCategory === 'aggressiveResponses' ? 'DESTROYED' : 'a TREMENDOUS response'}! Message: "${message.content}"`, 
            responseCategory === 'aggressiveResponses' ? 0xff0000 : 0x4f46e5);
    }

    // Skeeter mention detection and handling
    checkSkeeterMention(message) {
        // Skip Skeeter protection in specified channel
        if (message.channel.id === '1390547663216316499') {
            return false;
        }
        
        // Allow replies to Skeeter without triggering protection
        if (message.reference && message.reference.messageId) {
            // This is a reply to another message, don't trigger Skeeter protection
            return false;
        }
        
        // Check for actual user mentions of anyone named Skeeter (no text-based mentions)
        const mentionedUsers = message.mentions.users;
        
        // Debug: Log mentioned users
        if (mentionedUsers.size > 0) {
            console.log(`🔍 Mentioned users: ${Array.from(mentionedUsers.values()).map(u => `${u.username}#${u.discriminator} (${u.id})`).join(', ')}`);
        }
        
        // Check if any mentioned user has "skeeter" in username or display name
        const hasSkeeterMention = mentionedUsers.some(user => {
            const username = user.username.toLowerCase();
            const displayName = user.displayName?.toLowerCase() || '';
            const globalName = user.globalName?.toLowerCase() || '';
            
            const matches = username.includes('skeeter') || 
                           displayName.includes('skeeter') || 
                           globalName.includes('skeeter');
            
            if (matches) {
                console.log(`✅ Found Skeeter mention: ${user.username} (${user.id})`);
            }
            
            return matches;
        });
        
        // Also check for specific Skeeter user ID if configured
        const skeeterIds = config.ownerIds || [];
        const mentionsSkeeterById = mentionedUsers.some(user => {
            const matches = skeeterIds.includes(user.id);
            if (matches) {
                console.log(`✅ Found Skeeter by ID: ${user.username} (${user.id})`);
            }
            return matches;
        });
        
        const result = hasSkeeterMention || mentionsSkeeterById;
        if (mentionedUsers.size > 0 && !result) {
            console.log(`❌ No Skeeter match found in mentions`);
        }
        
        return result;
    }

    async handleSkeeterMention(message) {
        const user = message.author;
        const trumpTrashTalk = this.getTrumpResponse('skeeterWarning', { user: user.toString() });
        
        // Create a big, attention-grabbing warning embed
        const warningEmbed = new EmbedBuilder()
            .setTitle('🚨 SKEETER WARNING! 🚨')
            .setDescription(`**${trumpTrashTalk}**`)
            .setColor(0xff0000)
            .setThumbnail('https://i.imgur.com/VJcK3Gd.png') // Warning emoji/image
            .addFields(
                { name: '⚠️ TRUMP SAYS', value: 'TAGGING SKEETER IS FOR LOSERS!', inline: false },
                { name: '📢 Public Notice', value: `${user.username} just made a HUGE mistake!`, inline: false }
            )
            .setFooter({ text: 'Guardian Bot created by Skeeter - Make Discord Great Again!' })
            .setTimestamp();

        // Send the warning publicly in the channel for everyone to see
        await message.reply({ 
            content: `🚨 **${trumpTrashTalk}** 🚨`,
            embeds: [warningEmbed]
        });

        // Log the skeeter warning
        await this.logEvent(message.guild, 'Skeeter Auto-Warning', `${user.tag} mentioned Skeeter and got ROASTED by Trump AI! Message: "${message.content}"`, 0xff6600);
    }

    // Slash Command Handler
    async handleSlashCommand(interaction) {
        const { commandName, options } = interaction;

        try {
            switch (commandName) {
                // Security Commands (require permission)
                case 'lockdown':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
                    }
                    const lockdownReason = options.getString('reason') || `Manual lockdown by ${interaction.user.tag}`;
                    await this.lockdownServer(interaction.guild, lockdownReason);
                    await interaction.reply('🔒 Server has been locked down.');
                    break;

                case 'unlock':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
                    }
                    const unlockReason = options.getString('reason') || `Manual unlock by ${interaction.user.tag}`;
                    await this.unlockServer(interaction.guild, unlockReason);
                    await interaction.reply('🔓 Server lockdown has been lifted.');
                    break;

                case 'ban':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
                    }
                    await this.handleSlashBanCommand(interaction);
                    break;

                case 'kick':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
                    }
                    await this.handleSlashKickCommand(interaction);
                    break;

                case 'purge':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
                    }
                    await this.handleSlashPurgeCommand(interaction);
                    break;

                case 'emergency-restore':
                    if (!this.hasPermission(interaction.member)) {
                        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
                    }
                    await this.handleSlashEmergencyRestore(interaction);
                    break;

                // Ticket System Commands
                case 'ticket':
                    await this.createTicket(interaction);
                    break;

                case 'claim-ticket':
                    await this.claimTicket(interaction);
                    break;

                case 'close-ticket':
                    await this.closeTicket(interaction);
                    break;

                case 'delete-ticket':
                    await this.deleteTicket(interaction);
                    break;

                case 'ticket-panel':
                    await this.createTicketPanel(interaction);
                    break;

                case 'ticket-stats':
                    await this.handleTicketStatsCommand(interaction);
                    break;

                case 'ticket-transcript':
                    await this.handleTicketTranscriptCommand(interaction);
                    break;

                // Info Commands (no permission required)
                case 'status':
                    await this.handleSlashStatusCommand(interaction);
                    break;

                case 'settings':
                    await this.handleSlashSettingsCommand(interaction);
                    break;

                case 'help':
                    await this.handleSlashHelpCommand(interaction);
                    break;

                default:
                    await interaction.reply({ content: '❌ Unknown command.', ephemeral: true });
            }
        } catch (error) {
            console.error('Slash command error:', error);
            const errorMessage = '❌ An error occurred while executing this command.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }

    // Slash command implementations
    async handleSlashBanCommand(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: '❌ You do not have permission to ban members.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Check if user is protected
        if (config.protectedUsers && config.protectedUsers.includes(user.id)) {
            // Only server owner can ban protected users
            if (!config.ownerIds.includes(interaction.user.id)) {
                const protectEmbed = new EmbedBuilder()
                    .setTitle('🛡️ PROTECTED USER')
                    .setDescription(`**${user.tag} is protected and cannot be banned!**\n\nOnly the server owner can ban protected users.`)
                    .setColor(0xff0000)
                    .addFields(
                        { name: '🚫 Action Denied', value: 'Ban attempt blocked', inline: true },
                        { name: '👑 Required Permission', value: 'Server Owner Only', inline: true },
                        { name: '🔒 Protection Level', value: 'Maximum Security', inline: true }
                    )
                    .setFooter({ text: 'Guardian Bot Protection System' })
                    .setTimestamp();

                await this.logEvent(interaction.guild, 'Protected User Ban Attempt', 
                    `${interaction.user.tag} tried to ban protected user ${user.tag}`, 0xff0000);
                    
                return interaction.reply({ embeds: [protectEmbed], ephemeral: true });
            }
        }

        try {
            await interaction.guild.members.ban(user, { reason: `${reason} - Banned by ${interaction.user.tag}` });
            await interaction.reply(`✅ Successfully banned ${user.tag} for: ${reason}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to ban user. Please check my permissions.', ephemeral: true });
        }
    }

    async handleSlashKickCommand(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: '❌ You do not have permission to kick members.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.kick(`${reason} - Kicked by ${interaction.user.tag}`);
            await interaction.reply(`✅ Successfully kicked ${user.tag} for: ${reason}`);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to kick user. Please check my permissions.', ephemeral: true });
        }
    }

    async handleSlashPurgeCommand(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ You do not have permission to manage messages.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');

        try {
            const messages = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `✅ Successfully deleted ${messages.size} messages.`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to purge messages. Messages might be too old.', ephemeral: true });
        }
    }

    async handleSlashStatusCommand(interaction) {
        const guild = interaction.guild;
        const isLockedDown = this.lockdownStatus.get(guild.id) || false;

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Guardian Bot Status')
            .addFields(
                { name: '🔒 Lockdown Status', value: isLockedDown ? '🔴 ACTIVE' : '🟢 INACTIVE', inline: true },
                { name: '🛡️ Anti-Raid', value: config.antiRaid.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                { name: '💥 Anti-Nuke', value: config.antiNuke.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                { name: '👮 Admin Monitoring', value: config.adminMonitoring.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                { name: '📝 Logging', value: config.logging.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                { name: '⚡ Rapid Response', value: '🟢 Active', inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleSlashSettingsCommand(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Guardian Bot Settings')
            .addFields(
                { name: 'Anti-Raid Threshold', value: `${config.antiRaid.joinThreshold} joins in ${config.antiRaid.timeWindow/1000}s`, inline: true },
                { name: 'Admin Action Threshold', value: `${config.adminMonitoring.actionThreshold} actions in ${config.adminMonitoring.timeWindow/60000}min`, inline: true },
                { name: 'Anti-Nuke Threshold', value: `${config.antiNuke.channelDeleteThreshold} deletions in ${config.antiNuke.timeWindow/1000}s`, inline: true }
            )
            .setColor(0x0099ff)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async handleSlashEmergencyRestore(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚠️ EMERGENCY PERMISSION RESTORE')
            .setDescription('**WARNING:** This will remove ALL @everyone permission overwrites from ALL channels.\n\nThis should restore private channel visibility but will also remove any custom @everyone restrictions.\n\n**Are you sure you want to proceed?**')
            .setColor(0xffa500)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('emergency_restore_confirm')
                    .setLabel('✅ Confirm Restore')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('emergency_restore_cancel')
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const filter = i => i.user.id === interaction.user.id;
        try {
            const buttonInteraction = await interaction.followUp.awaitMessageComponent({ filter, time: 30000 });
            
            if (buttonInteraction.customId === 'emergency_restore_confirm') {
                await this.performEmergencyRestoreSlash(interaction.guild, buttonInteraction);
            } else {
                await buttonInteraction.update({ content: '❌ Emergency restore cancelled.', embeds: [], components: [] });
            }
        } catch (error) {
            await interaction.editReply({ content: '❌ Emergency restore timed out.', embeds: [], components: [] });
        }
    }

    async performEmergencyRestoreSlash(guild, interaction) {
        await interaction.update({ content: '🔄 **EMERGENCY RESTORE IN PROGRESS...**\nRemoving broken permission overwrites...', embeds: [], components: [] });

        let restoredCount = 0;
        let errorCount = 0;

        for (const [, channel] of guild.channels.cache) {
            try {
                const everyoneOverwrite = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
                
                if (everyoneOverwrite) {
                    await channel.permissionOverwrites.delete(guild.roles.everyone.id);
                    restoredCount++;
                }
            } catch (error) {
                errorCount++;
                console.error(`Failed to restore channel ${channel.name}:`, error);
            }
        }

        this.lockdownStatus.set(guild.id, false);

        const resultEmbed = new EmbedBuilder()
            .setTitle('✅ EMERGENCY RESTORE COMPLETED')
            .setDescription(`**Channels restored:** ${restoredCount}\n**Errors:** ${errorCount}\n\n**Next steps:**\n1. Check that private channels are now private again\n2. Review and manually set any custom @everyone restrictions that were needed\n3. The server is no longer in lockdown mode`)
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [resultEmbed] });
        await this.logEvent(guild, 'Emergency Restore', `Performed by ${interaction.user.tag} - ${restoredCount} channels restored`, 0xff9900);
    }

    async handleSlashHelpCommand(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Guardian Bot Commands')
            .setDescription('**Security & Moderation Slash Commands**')
            .addFields(
                { name: '🔒 /lockdown [reason]', value: 'Lock down the entire server', inline: true },
                { name: '🔓 /unlock [reason]', value: 'Remove server lockdown', inline: true },
                { name: '🔨 /ban <user> [reason]', value: 'Ban a user', inline: true },
                { name: '👢 /kick <user> [reason]', value: 'Kick a user', inline: true },
                { name: '🗑️ /purge <amount>', value: 'Delete messages (1-100)', inline: true },
                { name: '📊 /status', value: 'Show bot protection status', inline: true },
                { name: '⚙️ /settings', value: 'Show current settings', inline: true },
                { name: '🚨 /emergency-restore', value: 'Fix broken lockdown permissions', inline: true },
                { name: '🤖 /help', value: 'Show this help message', inline: true },
                { name: '🛡️ Auto-Protection', value: 'Mentions of "Skeeter" trigger automatic warnings!', inline: false }
            )
            .setColor(0x0099ff)
            .setFooter({ text: 'Guardian Bot created by Skeeter - Protecting your server 24/7' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    // Legacy Command Handler (keeping for backward compatibility)
    async handleCommand(message) {
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // Check if user has permission
        if (!this.hasPermission(message.member)) {
            return message.reply('❌ You do not have permission to use this command.');
        }

        switch (command) {
            case 'emergency-restore':
                await this.handleEmergencyRestore(message);
                break;

            case 'lockdown':
                await this.lockdownServer(message.guild, `Manual lockdown by ${message.author.tag}`);
                await message.reply('🔒 Server has been locked down.');
                break;

            case 'unlock':
                await this.unlockServer(message.guild, `Manual unlock by ${message.author.tag}`);
                await message.reply('🔓 Server lockdown has been lifted.');
                break;

            case 'ban':
                await this.handleBanCommand(message, args);
                break;

            case 'kick':
                await this.handleKickCommand(message, args);
                break;

            case 'purge':
                await this.handlePurgeCommand(message, args);
                break;

            case 'status':
                await this.handleStatusCommand(message);
                break;

            case 'whitelist':
                await this.handleWhitelistCommand(message, args);
                break;

            case 'settings':
                await this.handleSettingsCommand(message);
                break;

            case 'help':
                await this.handleHelpCommand(message);
                break;

            default:
                await message.reply('❌ Unknown command. Use `!help` for available commands.');
        }
    }

    // Emergency restore function for fixing broken lockdown
    async handleEmergencyRestore(message) {
        if (!this.hasPermission(message.member)) {
            return message.reply('❌ You do not have permission to use this command.');
        }

        const guild = message.guild;
        
        // Ask for confirmation
        const confirmEmbed = new EmbedBuilder()
            .setTitle('⚠️ EMERGENCY PERMISSION RESTORE')
            .setDescription('**WARNING:** This will remove ALL @everyone permission overwrites from ALL channels.\n\nThis should restore private channel visibility but will also remove any custom @everyone restrictions.\n\n**Are you sure you want to proceed?**\n\nReact with ✅ to confirm or ❌ to cancel.')
            .setColor(0xffa500)
            .setTimestamp();

        const confirmMessage = await message.reply({ embeds: [confirmEmbed] });
        await confirmMessage.react('✅');
        await confirmMessage.react('❌');

        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        try {
            const collected = await confirmMessage.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });
            const reaction = collected.first();

            if (reaction.emoji.name === '✅') {
                await this.performEmergencyRestore(guild, message);
            } else {
                await message.reply('❌ Emergency restore cancelled.');
            }
        } catch (error) {
            await message.reply('❌ Emergency restore timed out. Please try again.');
        }
    }

    async performEmergencyRestore(guild, message) {
        const statusMessage = await message.reply('🔄 **EMERGENCY RESTORE IN PROGRESS...**\nRemoving broken permission overwrites...');

        let restoredCount = 0;
        let errorCount = 0;

        // Remove ALL @everyone overwrites from all channels
        for (const [, channel] of guild.channels.cache) {
            try {
                // Check if @everyone has any overwrites
                const everyoneOverwrite = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
                
                if (everyoneOverwrite) {
                    await channel.permissionOverwrites.delete(guild.roles.everyone.id);
                    restoredCount++;
                    console.log(`Removed @everyone overwrites from: ${channel.name}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`Failed to restore channel ${channel.name}:`, error);
            }
        }

        // Reset lockdown status
        this.lockdownStatus.set(guild.id, false);

        // Send results
        const resultEmbed = new EmbedBuilder()
            .setTitle('✅ EMERGENCY RESTORE COMPLETED')
            .setDescription(`**Channels restored:** ${restoredCount}\n**Errors:** ${errorCount}\n\n**Next steps:**\n1. Check that private channels are now private again\n2. Review and manually set any custom @everyone restrictions that were needed\n3. The server is no longer in lockdown mode`)
            .setColor(0x00ff00)
            .setTimestamp();

        await statusMessage.edit({ content: '', embeds: [resultEmbed] });

        // Log the emergency restore
        await this.logEvent(guild, 'Emergency Restore', `Performed by ${message.author.tag} - ${restoredCount} channels restored`, 0xff9900);
    }

    async handleBanCommand(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ You do not have permission to ban members.');
        }

        const userId = args[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';

        if (!userId) {
            return message.reply('❌ Please provide a user ID or mention.');
        }

        try {
            const user = await this.client.users.fetch(userId.replace(/[<@!>]/g, ''));
            
            // Check if user is protected
            if (config.protectedUsers && config.protectedUsers.includes(user.id)) {
                // Only server owner can ban protected users
                if (!config.ownerIds.includes(message.author.id)) {
                    const protectEmbed = new EmbedBuilder()
                        .setTitle('🛡️ PROTECTED USER')
                        .setDescription(`**${user.tag} is protected and cannot be banned!**\n\nOnly the server owner can ban protected users.`)
                        .setColor(0xff0000)
                        .addFields(
                            { name: '🚫 Action Denied', value: 'Ban attempt blocked', inline: true },
                            { name: '👑 Required Permission', value: 'Server Owner Only', inline: true },
                            { name: '🔒 Protection Level', value: 'Maximum Security', inline: true }
                        )
                        .setFooter({ text: 'Guardian Bot Protection System' })
                        .setTimestamp();

                    await this.logEvent(message.guild, 'Protected User Ban Attempt', 
                        `${message.author.tag} tried to ban protected user ${user.tag}`, 0xff0000);
                        
                    return message.reply({ embeds: [protectEmbed] });
                }
            }
            
            await message.guild.members.ban(user, { reason: `${reason} - Banned by ${message.author.tag}` });
            await message.reply(`✅ Successfully banned ${user.tag} for: ${reason}`);
        } catch (error) {
            await message.reply('❌ Failed to ban user. Please check the user ID and my permissions.');
        }
    }

    async handleKickCommand(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ You do not have permission to kick members.');
        }

        const userId = args[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';

        if (!userId) {
            return message.reply('❌ Please provide a user ID or mention.');
        }

        try {
            const member = await message.guild.members.fetch(userId.replace(/[<@!>]/g, ''));
            await member.kick(`${reason} - Kicked by ${message.author.tag}`);
            await message.reply(`✅ Successfully kicked ${member.user.tag} for: ${reason}`);
        } catch (error) {
            await message.reply('❌ Failed to kick user. Please check the user ID and my permissions.');
        }
    }

    async handlePurgeCommand(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ You do not have permission to manage messages.');
        }

        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100) {
            return message.reply('❌ Please provide a number between 1 and 100.');
        }

        try {
            const messages = await message.channel.bulkDelete(amount + 1, true);
            const reply = await message.channel.send(`✅ Successfully deleted ${messages.size - 1} messages.`);
            setTimeout(() => reply.delete().catch(() => {}), 5000);
        } catch (error) {
            await message.reply('❌ Failed to purge messages. Messages might be too old.');
        }
    }

    async handleStatusCommand(message) {
        const guild = message.guild;
        const isLockedDown = this.lockdownStatus.get(guild.id) || false;

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Guardian Bot Status')
            .addFields(
                { name: '🔒 Lockdown Status', value: isLockedDown ? '🔴 ACTIVE' : '🟢 INACTIVE', inline: true },
                { name: '🛡️ Anti-Raid', value: config.antiRaid.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                { name: '💥 Anti-Nuke', value: config.antiNuke.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                { name: '👮 Admin Monitoring', value: config.adminMonitoring.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                { name: '📝 Logging', value: config.logging.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                { name: '⚡ Rapid Response', value: '🟢 Active', inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    async handleWhitelistCommand(message, args) {
        // Implementation for whitelisting users from certain protections
        await message.reply('🚧 Whitelist command is under development.');
    }

    async handleSettingsCommand(message) {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Guardian Bot Settings')
            .addFields(
                { name: 'Anti-Raid Threshold', value: `${config.antiRaid.joinThreshold} joins in ${config.antiRaid.timeWindow/1000}s`, inline: true },
                { name: 'Admin Action Threshold', value: `${config.adminMonitoring.actionThreshold} actions in ${config.adminMonitoring.timeWindow/60000}min`, inline: true },
                { name: 'Anti-Nuke Threshold', value: `${config.antiNuke.channelDeleteThreshold} deletions in ${config.antiNuke.timeWindow/1000}s`, inline: true }
            )
            .setColor(0x0099ff)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    async handleHelpCommand(message) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Guardian Bot Commands')
            .setDescription('**Security & Moderation Commands**')
            .addFields(
                { name: '🔒 !lockdown', value: 'Lock down the entire server', inline: true },
                { name: '🔓 !unlock', value: 'Remove server lockdown', inline: true },
                { name: '🔨 !ban <user> [reason]', value: 'Ban a user', inline: true },
                { name: '👢 !kick <user> [reason]', value: 'Kick a user', inline: true },
                { name: '🗑️ !purge <amount>', value: 'Delete messages (1-100)', inline: true },
                { name: '📊 !status', value: 'Show bot protection status', inline: true },
                { name: '⚙️ !settings', value: 'Show current settings', inline: true },
                { name: '🤖 !help', value: 'Show this help message', inline: true }
            )
            .setColor(0x0099ff)
            .setFooter({ text: 'Guardian Bot - Protecting your server 24/7' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // Utility Functions
    hasPermission(member) {
        if (config.ownerIds.includes(member.user.id)) return true;
        if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
        
        // Check configured admin role IDs
        if (config.adminRoleIds.some(roleId => member.roles.cache.has(roleId))) return true;
        
        // Check for roles with specific names: "Admin" and "Discord Moderator"
        const staffRoleNames = ['Admin', 'Discord Moderator', 'admin', 'discord moderator', 'ADMIN', 'DISCORD MODERATOR'];
        const hasStaffRole = member.roles.cache.some(role => 
            staffRoleNames.includes(role.name)
        );
        
        return hasStaffRole;
    }

    getStaffRoles(guild) {
        const staffRoles = [];
        
        // Add configured staff role IDs
        config.ticketSystem.staffRoleIds.forEach(roleId => {
            const role = guild.roles.cache.get(roleId);
            if (role) staffRoles.push(role);
        });
        
        // Add roles with specific names: "Admin" and "Discord Moderator"
        const staffRoleNames = ['Admin', 'Discord Moderator', 'admin', 'discord moderator', 'ADMIN', 'DISCORD MODERATOR'];
        guild.roles.cache.forEach(role => {
            if (staffRoleNames.includes(role.name) && !staffRoles.find(r => r.id === role.id)) {
                staffRoles.push(role);
            }
        });
        
        return staffRoles;
    }

    getStaffType(member) {
        if (config.ownerIds.includes(member.user.id)) return '👑 Bot Owner';
        if (member.permissions.has(PermissionFlagsBits.Administrator)) return '⚡ Administrator';
        
        // Check configured admin role IDs
        if (config.adminRoleIds.some(roleId => member.roles.cache.has(roleId))) return '🛡️ Server Admin';
        
        // Check for specific role names
        const adminRole = member.roles.cache.find(role => 
            ['Admin', 'admin', 'ADMIN'].includes(role.name)
        );
        if (adminRole) return `🔧 Admin (${adminRole.name})`;
        
        const modRole = member.roles.cache.find(role => 
            ['Discord Moderator', 'discord moderator', 'DISCORD MODERATOR'].includes(role.name)
        );
        if (modRole) return `🚨 Discord Moderator (${modRole.name})`;
        
        return '👮 Staff Member';
    }

    async logEvent(guild, eventType, description, color = 0x0099ff) {
        if (!config.logging.enabled) return;

        const embed = new EmbedBuilder()
            .setTitle(eventType)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();

        await this.sendToLogChannel(guild, embed);
    }

    async sendToLogChannel(guild, embed) {
        try {
            const logChannel = guild.channels.cache.get(config.logChannelId);
            if (logChannel && logChannel.isTextBased()) {
                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Failed to send to log channel:', error);
        }
    }

    // Start the bot
    start() {
        this.client.login(config.token);
        
        // Discord bot runs standalone - no web dashboard required
    }
}

// Create and start the bot
const guardian = new GuardianBot();
guardian.start();

module.exports = GuardianBot;