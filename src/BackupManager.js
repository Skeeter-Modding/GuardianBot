const fs = require('fs');
const path = require('path');

class BackupManager {
    constructor(configPath = './config.json') {
        this.configPath = configPath;
        this.backupDir = './backups';
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    // Create a backup of server data
    async createBackup(guild, reason = 'Manual backup') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupData = {
                metadata: {
                    guildId: guild.id,
                    guildName: guild.name,
                    timestamp: new Date().toISOString(),
                    reason: reason,
                    memberCount: guild.memberCount,
                    botVersion: require('../package.json').version
                },
                channels: [],
                roles: [],
                settings: this.loadConfig()
            };

            // Backup channels
            for (const [, channel] of guild.channels.cache) {
                backupData.channels.push({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type,
                    position: channel.position,
                    parentId: channel.parentId,
                    topic: channel.topic,
                    permissions: channel.permissionOverwrites?.cache?.map(overwrite => ({
                        id: overwrite.id,
                        type: overwrite.type,
                        allow: overwrite.allow.toArray(),
                        deny: overwrite.deny.toArray()
                    })) || []
                });
            }

            // Backup roles
            for (const [, role] of guild.roles.cache) {
                if (role.name !== '@everyone') {
                    backupData.roles.push({
                        id: role.id,
                        name: role.name,
                        color: role.color,
                        permissions: role.permissions.toArray(),
                        position: role.position,
                        mentionable: role.mentionable,
                        hoist: role.hoist
                    });
                }
            }

            const filename = `backup_${guild.id}_${timestamp}.json`;
            const filepath = path.join(this.backupDir, filename);
            
            fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
            
            console.log(`✅ Backup created: ${filename}`);
            return { success: true, filename, filepath };

        } catch (error) {
            console.error('❌ Failed to create backup:', error);
            return { success: false, error: error.message };
        }
    }

    // List all available backups
    listBackups(guildId = null) {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backups = files
                .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
                .filter(file => !guildId || file.includes(guildId))
                .map(file => {
                    const filepath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filepath);
                    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                    
                    return {
                        filename: file,
                        guildId: data.metadata.guildId,
                        guildName: data.metadata.guildName,
                        timestamp: data.metadata.timestamp,
                        reason: data.metadata.reason,
                        size: stats.size,
                        created: stats.birthtime
                    };
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return backups;
        } catch (error) {
            console.error('❌ Failed to list backups:', error);
            return [];
        }
    }

    // Load a specific backup
    loadBackup(filename) {
        try {
            const filepath = path.join(this.backupDir, filename);
            if (!fs.existsSync(filepath)) {
                throw new Error(`Backup file not found: ${filename}`);
            }

            const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            return { success: true, data };
        } catch (error) {
            console.error('❌ Failed to load backup:', error);
            return { success: false, error: error.message };
        }
    }

    // Clean old backups (keep only last N backups per guild)
    cleanOldBackups(keepCount = 10) {
        try {
            const backups = this.listBackups();
            const guilds = [...new Set(backups.map(b => b.guildId))];

            let deletedCount = 0;

            for (const guildId of guilds) {
                const guildBackups = backups.filter(b => b.guildId === guildId);
                
                if (guildBackups.length > keepCount) {
                    const toDelete = guildBackups.slice(keepCount);
                    
                    for (const backup of toDelete) {
                        const filepath = path.join(this.backupDir, backup.filename);
                        fs.unlinkSync(filepath);
                        deletedCount++;
                    }
                }
            }

            console.log(`🗑️ Cleaned ${deletedCount} old backup files`);
            return { success: true, deletedCount };

        } catch (error) {
            console.error('❌ Failed to clean backups:', error);
            return { success: false, error: error.message };
        }
    }

    // Load configuration
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            }
            return {};
        } catch (error) {
            console.error('❌ Failed to load config:', error);
            return {};
        }
    }

    // Save configuration
    saveConfig(config) {
        try {
            // Create backup of current config
            if (fs.existsSync(this.configPath)) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupPath = `${this.configPath}.backup.${timestamp}`;
                fs.copyFileSync(this.configPath, backupPath);
            }

            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to save config:', error);
            return { success: false, error: error.message };
        }
    }

    // Emergency restore function
    async emergencyRestore(guild, backupFilename) {
        console.log(`🚨 EMERGENCY RESTORE INITIATED for ${guild.name}`);
        
        const backup = this.loadBackup(backupFilename);
        if (!backup.success) {
            return backup;
        }

        const data = backup.data;
        const results = {
            channels: { created: 0, failed: 0 },
            roles: { created: 0, failed: 0 },
            errors: []
        };

        try {
            // Restore roles first (they're needed for channel permissions)
            console.log('🔄 Restoring roles...');
            for (const roleData of data.roles) {
                try {
                    await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        permissions: roleData.permissions,
                        mentionable: roleData.mentionable,
                        hoist: roleData.hoist,
                        reason: 'Emergency restore from backup'
                    });
                    results.roles.created++;
                } catch (error) {
                    results.roles.failed++;
                    results.errors.push(`Failed to restore role ${roleData.name}: ${error.message}`);
                }
            }

            // Restore channels
            console.log('🔄 Restoring channels...');
            for (const channelData of data.channels) {
                try {
                    await guild.channels.create({
                        name: channelData.name,
                        type: channelData.type,
                        topic: channelData.topic,
                        parent: channelData.parentId,
                        reason: 'Emergency restore from backup'
                    });
                    results.channels.created++;
                } catch (error) {
                    results.channels.failed++;
                    results.errors.push(`Failed to restore channel ${channelData.name}: ${error.message}`);
                }
            }

            console.log('✅ Emergency restore completed');
            return { success: true, results };

        } catch (error) {
            console.error('❌ Emergency restore failed:', error);
            return { success: false, error: error.message, results };
        }
    }
}

module.exports = BackupManager;