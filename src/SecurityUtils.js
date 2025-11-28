const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

class SecurityUtils {
    constructor() {
        this.suspiciousPatterns = [
            /discord\.gg\/\w+/gi,           // Discord invite links
            /discordapp\.com\/invite\/\w+/gi, // Discord invite links
            /@everyone|@here/gi,            // Mass mentions
            /\bhttps?:\/\/[^\s]+/gi,        // General URLs (for spam detection)
        ];
        
        this.bannedWords = [
            'raid', 'nuke', 'destroy', 'delete all', 'mass delete',
            'admin abuse', 'hack', 'exploit', 'crash'
        ];
    }

    // Advanced spam detection
    detectSpam(message) {
        const content = message.content.toLowerCase();
        
        // Check for suspicious patterns
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(content)) {
                return { isSpam: true, reason: 'Suspicious pattern detected', pattern: pattern.source };
            }
        }

        // Check for banned words
        for (const word of this.bannedWords) {
            if (content.includes(word)) {
                return { isSpam: true, reason: 'Banned word detected', word };
            }
        }

        // Check for excessive capitals (>70% caps)
        const capsPercentage = (content.match(/[A-Z]/g) || []).length / content.length;
        if (capsPercentage > 0.7 && content.length > 10) {
            return { isSpam: true, reason: 'Excessive capitals', percentage: Math.round(capsPercentage * 100) };
        }

        // Check for repeated characters (like "aaaaaaa")
        const repeatedChars = /(.)\1{5,}/g;
        if (repeatedChars.test(content)) {
            return { isSpam: true, reason: 'Repeated characters spam' };
        }

        return { isSpam: false };
    }

    // Check if user has dangerous permissions
    hasDangerousPermissions(member) {
        const dangerousPerms = [
            PermissionFlagsBits.Administrator,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.ManageGuild,
            PermissionFlagsBits.ManageMessages
        ];

        return dangerousPerms.some(perm => member.permissions.has(perm));
    }

    // Generate security report
    generateSecurityReport(guild, stats) {
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Security Report')
            .setDescription(`Security overview for ${guild.name}`)
            .addFields(
                { name: '👥 Total Members', value: guild.memberCount.toString(), inline: true },
                { name: '🤖 Bot Count', value: guild.members.cache.filter(m => m.user.bot).size.toString(), inline: true },
                { name: '👮 Admin Count', value: guild.members.cache.filter(m => this.hasDangerousPermissions(m)).size.toString(), inline: true },
                { name: '🚫 Recent Bans', value: (stats.recentBans || 0).toString(), inline: true },
                { name: '👢 Recent Kicks', value: (stats.recentKicks || 0).toString(), inline: true },
                { name: '⚠️ Security Alerts', value: (stats.securityAlerts || 0).toString(), inline: true }
            )
            .setColor(0x0099ff)
            .setTimestamp();

        return embed;
    }

    // Analyze suspicious account
    analyzeSuspiciousAccount(member) {
        const suspiciousFactors = [];
        const now = Date.now();
        
        // Account age check (less than 7 days)
        const accountAge = now - member.user.createdTimestamp;
        if (accountAge < 7 * 24 * 60 * 60 * 1000) {
            suspiciousFactors.push('New account (less than 7 days old)');
        }

        // Join time vs account creation (joined very soon after creation)
        if (member.joinedTimestamp && (member.joinedTimestamp - member.user.createdTimestamp) < 24 * 60 * 60 * 1000) {
            suspiciousFactors.push('Joined very soon after account creation');
        }

        // No avatar (default Discord avatar)
        if (!member.user.avatar) {
            suspiciousFactors.push('Using default avatar');
        }

        // Suspicious username patterns
        const username = member.user.username.toLowerCase();
        if (/^\w+\d{4,}$/.test(username)) {
            suspiciousFactors.push('Username has suspicious pattern (letters + many numbers)');
        }

        if (username.length < 3) {
            suspiciousFactors.push('Very short username');
        }

        const suspiciousnessLevel = suspiciousFactors.length;
        
        return {
            isSuspicious: suspiciousnessLevel >= 2,
            suspiciousnessLevel,
            factors: suspiciousFactors,
            riskLevel: suspiciousnessLevel >= 4 ? 'HIGH' : suspiciousnessLevel >= 2 ? 'MEDIUM' : 'LOW'
        };
    }

    // Rate limiting utility
    createRateLimiter(maxActions, timeWindow) {
        const actions = new Map();
        
        return {
            isLimited: (key) => {
                const now = Date.now();
                
                if (!actions.has(key)) {
                    actions.set(key, []);
                }
                
                const userActions = actions.get(key);
                
                // Clean old actions
                const validActions = userActions.filter(time => now - time < timeWindow);
                actions.set(key, validActions);
                
                // Check if limit exceeded
                if (validActions.length >= maxActions) {
                    return true;
                }
                
                // Add current action
                validActions.push(now);
                return false;
            },
            
            reset: (key) => {
                actions.delete(key);
            },
            
            getActionCount: (key) => {
                const now = Date.now();
                const userActions = actions.get(key) || [];
                return userActions.filter(time => now - time < timeWindow).length;
            }
        };
    }

    // Advanced permission checker
    checkBotPermissions(guild) {
        const botMember = guild.members.me;
        const requiredPermissions = [
            PermissionFlagsBits.ViewChannels,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.ViewAuditLog
        ];

        const missingPermissions = [];
        
        for (const permission of requiredPermissions) {
            if (!botMember.permissions.has(permission)) {
                missingPermissions.push(this.getPermissionName(permission));
            }
        }

        return {
            hasAllPermissions: missingPermissions.length === 0,
            missingPermissions
        };
    }

    getPermissionName(permission) {
        const permissionNames = {
            [PermissionFlagsBits.ViewChannels]: 'View Channels',
            [PermissionFlagsBits.SendMessages]: 'Send Messages',
            [PermissionFlagsBits.ManageMessages]: 'Manage Messages',
            [PermissionFlagsBits.EmbedLinks]: 'Embed Links',
            [PermissionFlagsBits.ReadMessageHistory]: 'Read Message History',
            [PermissionFlagsBits.KickMembers]: 'Kick Members',
            [PermissionFlagsBits.BanMembers]: 'Ban Members',
            [PermissionFlagsBits.ManageChannels]: 'Manage Channels',
            [PermissionFlagsBits.ManageRoles]: 'Manage Roles',
            [PermissionFlagsBits.ViewAuditLog]: 'View Audit Log'
        };

        return permissionNames[permission] || 'Unknown Permission';
    }

    // Create backup of important server data
    async createServerBackup(guild) {
        const backup = {
            guildId: guild.id,
            guildName: guild.name,
            timestamp: new Date().toISOString(),
            channels: [],
            roles: [],
            memberCount: guild.memberCount
        };

        // Backup channel structure
        for (const [, channel] of guild.channels.cache) {
            backup.channels.push({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position,
                parentId: channel.parentId
            });
        }

        // Backup role structure
        for (const [, role] of guild.roles.cache) {
            if (role.name !== '@everyone') {
                backup.roles.push({
                    id: role.id,
                    name: role.name,
                    color: role.color,
                    permissions: role.permissions.toArray(),
                    position: role.position
                });
            }
        }

        return backup;
    }
}

module.exports = SecurityUtils;