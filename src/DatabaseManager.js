// Guardian Bot - MySQL Database Manager
// Handles all database operations for persistent data storage

const mysql = require('mysql2/promise');
const config = require('../config.json');

class DatabaseManager {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        if (!config.database.enabled) {
            console.log('📊 Database is disabled in config');
            return false;
        }

        try {
            // Create connection pool
            this.pool = mysql.createPool({
                host: config.database.host,
                port: config.database.port,
                user: config.database.user,
                password: config.database.password,
                database: config.database.database,
                connectionLimit: config.database.connectionLimit,
                ssl: config.database.ssl
            });

            // Test connection
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();

            console.log('✅ Connected to MySQL database successfully!');
            this.isConnected = true;

            // Initialize tables
            await this.initializeTables();
            
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    async initializeTables() {
        try {
            // Create tickets table
            await this.query(`
                CREATE TABLE IF NOT EXISTS tickets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ticket_id VARCHAR(50) UNIQUE NOT NULL,
                    channel_id VARCHAR(20) NOT NULL,
                    creator_id VARCHAR(20) NOT NULL,
                    creator_username VARCHAR(100) NOT NULL,
                    subject TEXT NOT NULL,
                    description TEXT,
                    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                    status ENUM('open', 'claimed', 'closed', 'deleted') DEFAULT 'open',
                    claimed_by VARCHAR(20) NULL,
                    claimed_by_username VARCHAR(100) NULL,
                    claimed_at TIMESTAMP NULL,
                    closed_by VARCHAR(20) NULL,
                    closed_by_username VARCHAR(100) NULL,
                    closed_at TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_channel_id (channel_id),
                    INDEX idx_creator_id (creator_id),
                    INDEX idx_status (status),
                    INDEX idx_priority (priority)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create staff statistics table
            await this.query(`
                CREATE TABLE IF NOT EXISTS staff_stats (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(20) UNIQUE NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    tickets_claimed INT DEFAULT 0,
                    tickets_closed INT DEFAULT 0,
                    tickets_deleted INT DEFAULT 0,
                    total_response_time BIGINT DEFAULT 0,
                    response_count INT DEFAULT 0,
                    avg_response_time DECIMAL(10,2) AS (
                        CASE WHEN response_count > 0 
                        THEN total_response_time / response_count / 60000 
                        ELSE 0 END
                    ) STORED,
                    first_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_username (username)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create moderation logs table
            await this.query(`
                CREATE TABLE IF NOT EXISTS moderation_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    action_type VARCHAR(50) NOT NULL,
                    moderator_id VARCHAR(20) NOT NULL,
                    moderator_username VARCHAR(100) NOT NULL,
                    target_id VARCHAR(20) NULL,
                    target_username VARCHAR(100) NULL,
                    reason TEXT,
                    details JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_action_type (action_type),
                    INDEX idx_moderator_id (moderator_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create anti-raid tracking table
            await this.query(`
                CREATE TABLE IF NOT EXISTS raid_tracking (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    user_id VARCHAR(20) NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    join_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ip_address VARCHAR(45) NULL,
                    account_age_days INT NULL,
                    is_suspicious BOOLEAN DEFAULT FALSE,
                    action_taken ENUM('none', 'kick', 'ban', 'quarantine') DEFAULT 'none',
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_join_timestamp (join_timestamp),
                    INDEX idx_is_suspicious (is_suspicious)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create owner protection table
            await this.query(`
                CREATE TABLE IF NOT EXISTS owner_protection (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    user_id VARCHAR(20) NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    violation_type ENUM('mention', 'ban', 'kick', 'timeout') NOT NULL,
                    message_content TEXT NULL,
                    warning_count INT DEFAULT 1,
                    action_taken VARCHAR(100) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_violation_type (violation_type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create staff activity tracking table
            await this.query(`
                CREATE TABLE IF NOT EXISTS staff_activity (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    user_id VARCHAR(20) NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    activity_type ENUM('message', 'command', 'voice_join', 'voice_leave', 'reaction', 'moderation') NOT NULL,
                    channel_id VARCHAR(20) NULL,
                    channel_name VARCHAR(100) NULL,
                    activity_data JSON NULL,
                    activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_activity_type (activity_type),
                    INDEX idx_activity_timestamp (activity_timestamp)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create staff response metrics table
            await this.query(`
                CREATE TABLE IF NOT EXISTS staff_metrics (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    user_id VARCHAR(20) UNIQUE NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    daily_messages INT DEFAULT 0,
                    daily_commands INT DEFAULT 0,
                    daily_voice_time INT DEFAULT 0,
                    weekly_messages INT DEFAULT 0,
                    weekly_commands INT DEFAULT 0,
                    weekly_voice_time INT DEFAULT 0,
                    monthly_messages INT DEFAULT 0,
                    monthly_commands INT DEFAULT 0,
                    monthly_voice_time INT DEFAULT 0,
                    total_messages INT DEFAULT 0,
                    total_commands INT DEFAULT 0,
                    total_voice_time INT DEFAULT 0,
                    last_message TIMESTAMP NULL,
                    last_command TIMESTAMP NULL,
                    last_voice_activity TIMESTAMP NULL,
                    activity_score DECIMAL(10,2) DEFAULT 0,
                    responsiveness_rating ENUM('excellent', 'good', 'average', 'poor', 'inactive') DEFAULT 'inactive',
                    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_activity_score (activity_score),
                    INDEX idx_responsiveness_rating (responsiveness_rating)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create user experience and leveling table
            await this.query(`
                CREATE TABLE IF NOT EXISTS user_levels (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    user_id VARCHAR(20) NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    xp BIGINT DEFAULT 0,
                    level INT DEFAULT 0,
                    messages_sent INT DEFAULT 0,
                    last_xp_gain TIMESTAMP NULL,
                    total_xp_earned BIGINT DEFAULT 0,
                    level_up_notifications BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_user_guild (guild_id, user_id),
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_level (level),
                    INDEX idx_xp (xp)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create role rewards table (automatic role assignment on level up)
            await this.query(`
                CREATE TABLE IF NOT EXISTS role_rewards (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    role_id VARCHAR(20) NOT NULL,
                    role_name VARCHAR(100) NOT NULL,
                    required_level INT NOT NULL,
                    remove_previous BOOLEAN DEFAULT FALSE,
                    created_by VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_level (required_level),
                    UNIQUE KEY unique_guild_role (guild_id, role_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create custom commands table
            await this.query(`
                CREATE TABLE IF NOT EXISTS custom_commands (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    command_name VARCHAR(50) NOT NULL,
                    command_response TEXT NOT NULL,
                    created_by VARCHAR(20) NOT NULL,
                    created_by_username VARCHAR(100) NOT NULL,
                    uses INT DEFAULT 0,
                    enabled BOOLEAN DEFAULT TRUE,
                    delete_trigger BOOLEAN DEFAULT FALSE,
                    dm_response BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_command_name (command_name),
                    UNIQUE KEY unique_guild_command (guild_id, command_name)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create auto-moderation settings table
            await this.query(`
                CREATE TABLE IF NOT EXISTS automod_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) UNIQUE NOT NULL,
                    spam_detection BOOLEAN DEFAULT TRUE,
                    spam_limit INT DEFAULT 5,
                    spam_timeframe INT DEFAULT 5,
                    bad_words_filter BOOLEAN DEFAULT TRUE,
                    blocked_words TEXT NULL,
                    invite_filter BOOLEAN DEFAULT TRUE,
                    caps_filter BOOLEAN DEFAULT TRUE,
                    caps_percentage INT DEFAULT 70,
                    emoji_spam_filter BOOLEAN DEFAULT TRUE,
                    emoji_limit INT DEFAULT 10,
                    repeated_text_filter BOOLEAN DEFAULT TRUE,
                    punishment_type ENUM('warn', 'mute', 'kick', 'ban') DEFAULT 'mute',
                    punishment_duration INT DEFAULT 300,
                    violation_threshold INT DEFAULT 3,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create reaction roles table
            await this.query(`
                CREATE TABLE IF NOT EXISTS reaction_roles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    message_id VARCHAR(20) NOT NULL,
                    channel_id VARCHAR(20) NOT NULL,
                    emoji VARCHAR(100) NOT NULL,
                    role_id VARCHAR(20) NOT NULL,
                    role_name VARCHAR(100) NOT NULL,
                    created_by VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_message_id (message_id),
                    UNIQUE KEY unique_message_emoji (message_id, emoji)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create welcome/goodbye settings table
            await this.query(`
                CREATE TABLE IF NOT EXISTS welcome_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) UNIQUE NOT NULL,
                    welcome_enabled BOOLEAN DEFAULT FALSE,
                    welcome_channel_id VARCHAR(20) NULL,
                    welcome_message TEXT NULL,
                    welcome_dm BOOLEAN DEFAULT FALSE,
                    welcome_dm_message TEXT NULL,
                    goodbye_enabled BOOLEAN DEFAULT FALSE,
                    goodbye_channel_id VARCHAR(20) NULL,
                    goodbye_message TEXT NULL,
                    auto_role_id VARCHAR(20) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            // Create auto-moderation violations table
            await this.query(`
                CREATE TABLE IF NOT EXISTS automod_violations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    user_id VARCHAR(20) NOT NULL,
                    username VARCHAR(255) NOT NULL,
                    violation_type ENUM('invite_spam', 'hate_speech', 'bad_words', 'spam', 'caps_spam', 'emoji_spam', 'repeated_text') NOT NULL,
                    message_content TEXT NULL,
                    channel_id VARCHAR(20) NOT NULL,
                    punishment_applied ENUM('warn', 'mute_5m', 'mute_30m', 'mute_2h', 'mute_24h', 'kick', 'ban') NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_guild_user (guild_id, user_id),
                    INDEX idx_violation_type (violation_type),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            console.log('✅ Database tables initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize database tables:', error);
        }
    }

    async query(sql, params = []) {
        if (!this.isConnected || !this.pool) {
            throw new Error('Database not connected');
        }

        try {
            const [results] = await this.pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('❌ Database query error:', error);
            throw error;
        }
    }

    // Ticket Management
    async saveTicket(ticketData) {
        try {
            const sql = `
                INSERT INTO tickets (
                    ticket_id, channel_id, creator_id, creator_username,
                    subject, description, priority, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                ticketData.ticketId,
                ticketData.channelId,
                ticketData.creatorId,
                ticketData.creatorUsername,
                ticketData.subject,
                ticketData.description,
                ticketData.priority,
                'open'
            ];

            await this.query(sql, params);
            return true;
        } catch (error) {
            console.error('❌ Failed to save ticket:', error);
            return false;
        }
    }

    async claimTicket(channelId, claimedBy, claimedByUsername) {
        try {
            const sql = `
                UPDATE tickets 
                SET status = 'claimed', claimed_by = ?, claimed_by_username = ?, claimed_at = NOW()
                WHERE channel_id = ? AND status = 'open'
            `;
            
            await this.query(sql, [claimedBy, claimedByUsername, channelId]);
            return true;
        } catch (error) {
            console.error('❌ Failed to claim ticket:', error);
            return false;
        }
    }

    async closeTicket(channelId, closedBy, closedByUsername) {
        try {
            const sql = `
                UPDATE tickets 
                SET status = 'closed', closed_by = ?, closed_by_username = ?, closed_at = NOW()
                WHERE channel_id = ? AND status IN ('open', 'claimed')
            `;
            
            await this.query(sql, [closedBy, closedByUsername, channelId]);
            return true;
        } catch (error) {
            console.error('❌ Failed to close ticket:', error);
            return false;
        }
    }

    async deleteTicket(channelId) {
        try {
            const sql = `UPDATE tickets SET status = 'deleted' WHERE channel_id = ?`;
            await this.query(sql, [channelId]);
            return true;
        } catch (error) {
            console.error('❌ Failed to delete ticket:', error);
            return false;
        }
    }

    async getTicket(channelId) {
        try {
            const sql = `SELECT * FROM tickets WHERE channel_id = ? LIMIT 1`;
            const results = await this.query(sql, [channelId]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('❌ Failed to get ticket:', error);
            return null;
        }
    }

    async getTicketStats() {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_tickets,
                    COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
                    COUNT(CASE WHEN status = 'claimed' THEN 1 END) as claimed_tickets,
                    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_tickets,
                    COUNT(CASE WHEN status = 'deleted' THEN 1 END) as deleted_tickets,
                    AVG(CASE WHEN claimed_at IS NOT NULL 
                        THEN TIMESTAMPDIFF(MINUTE, created_at, claimed_at) 
                        END) as avg_claim_time_minutes
                FROM tickets
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `;
            
            const results = await this.query(sql);
            return results[0];
        } catch (error) {
            console.error('❌ Failed to get ticket stats:', error);
            return null;
        }
    }

    // Staff Statistics
    async updateStaffStats(userId, username, action, responseTime = null) {
        try {
            // Insert or update staff member
            const upsertSql = `
                INSERT INTO staff_stats (user_id, username, ${action}) 
                VALUES (?, ?, 1)
                ON DUPLICATE KEY UPDATE 
                    username = VALUES(username),
                    ${action} = ${action} + 1,
                    ${responseTime ? 'total_response_time = total_response_time + ?, response_count = response_count + 1,' : ''}
                    last_activity = NOW()
            `;

            const params = responseTime 
                ? [userId, username, responseTime]
                : [userId, username];

            await this.query(upsertSql, params);
            return true;
        } catch (error) {
            console.error('❌ Failed to update staff stats:', error);
            return false;
        }
    }

    async getStaffLeaderboard(limit = 10) {
        try {
            const sql = `
                SELECT 
                    username,
                    tickets_claimed,
                    tickets_closed,
                    tickets_deleted,
                    avg_response_time,
                    last_activity
                FROM staff_stats 
                ORDER BY tickets_closed DESC, avg_response_time ASC 
                LIMIT ?
            `;
            
            return await this.query(sql, [limit]);
        } catch (error) {
            console.error('❌ Failed to get staff leaderboard:', error);
            return [];
        }
    }

    // Moderation Logging
    async logModeration(guildId, actionType, moderatorId, moderatorUsername, targetId = null, targetUsername = null, reason = null, details = null) {
        try {
            const sql = `
                INSERT INTO moderation_logs (
                    guild_id, action_type, moderator_id, moderator_username,
                    target_id, target_username, reason, details
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                guildId, actionType, moderatorId, moderatorUsername,
                targetId, targetUsername, reason, 
                details ? JSON.stringify(details) : null
            ];

            await this.query(sql, params);
            return true;
        } catch (error) {
            console.error('❌ Failed to log moderation action:', error);
            return false;
        }
    }

    // Owner Protection
    async logOwnerViolation(guildId, userId, username, violationType, messageContent = null, actionTaken = null) {
        try {
            const sql = `
                INSERT INTO owner_protection (
                    guild_id, user_id, username, violation_type, 
                    message_content, action_taken
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    warning_count = warning_count + 1,
                    message_content = VALUES(message_content),
                    action_taken = VALUES(action_taken)
            `;
            
            await this.query(sql, [guildId, userId, username, violationType, messageContent, actionTaken]);
            return true;
        } catch (error) {
            console.error('❌ Failed to log owner violation:', error);
            return false;
        }
    }

    // Staff Activity Tracking
    async logStaffActivity(guildId, userId, username, activityType, channelId = null, channelName = null, activityData = null) {
        try {
            const sql = `
                INSERT INTO staff_activity (
                    guild_id, user_id, username, activity_type, 
                    channel_id, channel_name, activity_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                guildId, userId, username, activityType,
                channelId, channelName,
                activityData ? JSON.stringify(activityData) : null
            ];

            await this.query(sql, params);
            
            // Update staff metrics
            await this.updateStaffMetrics(guildId, userId, username, activityType);
            return true;
        } catch (error) {
            console.error('❌ Failed to log staff activity:', error);
            return false;
        }
    }

    async updateStaffMetrics(guildId, userId, username, activityType) {
        try {
            // Use a proper INSERT with default values and then UPDATE
            const sql = `
                INSERT INTO staff_metrics (guild_id, user_id, username, first_seen)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    username = VALUES(username),
                    daily_messages = CASE WHEN ? = 'message' THEN daily_messages + 1 ELSE daily_messages END,
                    weekly_messages = CASE WHEN ? = 'message' THEN weekly_messages + 1 ELSE weekly_messages END,
                    monthly_messages = CASE WHEN ? = 'message' THEN monthly_messages + 1 ELSE monthly_messages END,
                    total_messages = CASE WHEN ? = 'message' THEN total_messages + 1 ELSE total_messages END,
                    daily_commands = CASE WHEN ? IN ('command', 'moderation') THEN daily_commands + 1 ELSE daily_commands END,
                    weekly_commands = CASE WHEN ? IN ('command', 'moderation') THEN weekly_commands + 1 ELSE weekly_commands END,
                    monthly_commands = CASE WHEN ? IN ('command', 'moderation') THEN monthly_commands + 1 ELSE monthly_commands END,
                    total_commands = CASE WHEN ? IN ('command', 'moderation') THEN total_commands + 1 ELSE total_commands END,
                    daily_voice_time = CASE WHEN ? IN ('voice_join', 'voice_leave') THEN daily_voice_time + 1 ELSE daily_voice_time END,
                    last_message = CASE WHEN ? = 'message' THEN NOW() ELSE last_message END,
                    last_command = CASE WHEN ? IN ('command', 'moderation') THEN NOW() ELSE last_command END,
                    last_voice_activity = CASE WHEN ? IN ('voice_join', 'voice_leave') THEN NOW() ELSE last_voice_activity END,
                    activity_score = ROUND((total_messages * 1.0 + total_commands * 2.0 + total_voice_time * 0.5) / GREATEST(DATEDIFF(NOW(), first_seen), 1), 2),
                    responsiveness_rating = CASE 
                        WHEN activity_score >= 50 THEN 'excellent'
                        WHEN activity_score >= 30 THEN 'good'  
                        WHEN activity_score >= 15 THEN 'average'
                        WHEN activity_score >= 5 THEN 'poor'
                        ELSE 'inactive'
                    END
            `;

            await this.query(sql, [guildId, userId, username, activityType, activityType, activityType, activityType, activityType, activityType, activityType, activityType, activityType, activityType, activityType, activityType]);
            return true;
        } catch (error) {
            console.error('❌ Failed to update staff metrics:', error);
            return false;
        }
    }

    async getStaffActivityReport(guildId, days = 7) {
        try {
            const sql = `
                SELECT 
                    sm.user_id,
                    sm.username,
                    sm.daily_messages,
                    sm.daily_commands,
                    sm.daily_voice_time,
                    sm.weekly_messages,
                    sm.weekly_commands,
                    sm.weekly_voice_time,
                    sm.activity_score,
                    sm.responsiveness_rating,
                    sm.last_message,
                    sm.last_command,
                    sm.last_voice_activity,
                    COUNT(sa.id) as total_activities,
                    COUNT(CASE WHEN sa.activity_type = 'message' THEN 1 END) as recent_messages,
                    COUNT(CASE WHEN sa.activity_type = 'command' THEN 1 END) as recent_commands,
                    COUNT(CASE WHEN sa.activity_type = 'moderation' THEN 1 END) as recent_moderations
                FROM staff_metrics sm
                LEFT JOIN staff_activity sa ON sm.user_id = sa.user_id 
                    AND sa.guild_id = ? 
                    AND sa.activity_timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
                WHERE sm.guild_id = ?
                GROUP BY sm.user_id, sm.username
                ORDER BY sm.activity_score DESC, sm.last_message DESC
            `;
            
            return await this.query(sql, [guildId, days, guildId]);
        } catch (error) {
            console.error('❌ Failed to get staff activity report:', error);
            return [];
        }
    }

    async resetDailyMetrics() {
        try {
            const sql = `
                UPDATE staff_metrics 
                SET daily_messages = 0, daily_commands = 0, daily_voice_time = 0
            `;
            await this.query(sql);
            return true;
        } catch (error) {
            console.error('❌ Failed to reset daily metrics:', error);
            return false;
        }
    }

    async resetWeeklyMetrics() {
        try {
            const sql = `
                UPDATE staff_metrics 
                SET weekly_messages = 0, weekly_commands = 0, weekly_voice_time = 0
            `;
            await this.query(sql);
            return true;
        } catch (error) {
            console.error('❌ Failed to reset weekly metrics:', error);
            return false;
        }
    }

    async resetMonthlyMetrics() {
        try {
            const sql = `
                UPDATE staff_metrics 
                SET monthly_messages = 0, monthly_commands = 0, monthly_voice_time = 0
            `;
            await this.query(sql);
            return true;
        } catch (error) {
            console.error('❌ Failed to reset monthly metrics:', error);
            return false;
        }
    }

    // XP and Leveling System
    async addUserXP(guildId, userId, username, xpGain = 15) {
        try {
            // Check if user gained XP recently (1 minute cooldown)
            const cooldownCheck = await this.query(`
                SELECT last_xp_gain FROM user_levels 
                WHERE guild_id = ? AND user_id = ? 
                AND last_xp_gain > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
            `, [guildId, userId]);

            if (cooldownCheck.length > 0) {
                return { gained: false, reason: 'cooldown' };
            }

            // Insert or update user XP
            const result = await this.query(`
                INSERT INTO user_levels (guild_id, user_id, username, xp, messages_sent, total_xp_earned, last_xp_gain)
                VALUES (?, ?, ?, ?, 1, ?, NOW())
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    xp = xp + VALUES(xp),
                    messages_sent = messages_sent + 1,
                    total_xp_earned = total_xp_earned + VALUES(xp),
                    last_xp_gain = NOW()
            `, [guildId, userId, username, xpGain, xpGain]);

            // Get updated user data
            const userData = await this.query(`
                SELECT xp, level FROM user_levels 
                WHERE guild_id = ? AND user_id = ?
            `, [guildId, userId]);

            if (userData.length === 0) return { gained: false, reason: 'error' };

            const currentXP = userData[0].xp;
            const currentLevel = userData[0].level;
            
            // Calculate required XP for next level (formula: 5 * (level^2) + 50 * level + 100)
            const newLevel = this.calculateLevelFromXP(currentXP);
            
            if (newLevel > currentLevel) {
                // Level up!
                await this.query(`
                    UPDATE user_levels 
                    SET level = ? 
                    WHERE guild_id = ? AND user_id = ?
                `, [newLevel, guildId, userId]);

                return {
                    gained: true,
                    xpGained: xpGain,
                    totalXP: currentXP,
                    levelUp: true,
                    newLevel: newLevel,
                    oldLevel: currentLevel
                };
            }

            return {
                gained: true,
                xpGained: xpGain,
                totalXP: currentXP,
                levelUp: false,
                currentLevel: currentLevel
            };
        } catch (error) {
            console.error('❌ Failed to add user XP:', error);
            return { gained: false, reason: 'error' };
        }
    }

    calculateLevelFromXP(xp) {
        // Formula: 5 * (level^2) + 50 * level + 100
        let level = 0;
        let requiredXP = 0;
        
        while (requiredXP <= xp) {
            level++;
            requiredXP = 5 * (level * level) + 50 * level + 100;
        }
        
        return level - 1;
    }

    calculateXPForLevel(level) {
        // Calculate total XP needed to reach a specific level
        let totalXP = 0;
        for (let i = 1; i <= level; i++) {
            totalXP += 5 * (i * i) + 50 * i + 100;
        }
        return totalXP;
    }

    async getUserLevel(guildId, userId) {
        try {
            const result = await this.query(`
                SELECT * FROM user_levels 
                WHERE guild_id = ? AND user_id = ?
            `, [guildId, userId]);

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('❌ Failed to get user level:', error);
            return null;
        }
    }

    async getLeaderboard(guildId, limit = 10) {
        try {
            const result = await this.query(`
                SELECT user_id, username, xp, level, messages_sent 
                FROM user_levels 
                WHERE guild_id = ? 
                ORDER BY xp DESC 
                LIMIT ?
            `, [guildId, limit]);

            return result;
        } catch (error) {
            console.error('❌ Failed to get leaderboard:', error);
            return [];
        }
    }

    // Role Rewards System
    async addRoleReward(guildId, roleId, roleName, requiredLevel, removePrevious, createdBy) {
        try {
            await this.query(`
                INSERT INTO role_rewards (guild_id, role_id, role_name, required_level, remove_previous, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    role_name = VALUES(role_name),
                    required_level = VALUES(required_level),
                    remove_previous = VALUES(remove_previous)
            `, [guildId, roleId, roleName, requiredLevel, removePrevious, createdBy]);

            return true;
        } catch (error) {
            console.error('❌ Failed to add role reward:', error);
            return false;
        }
    }

    async getRoleRewards(guildId) {
        try {
            const result = await this.query(`
                SELECT * FROM role_rewards 
                WHERE guild_id = ? 
                ORDER BY required_level ASC
            `, [guildId]);

            return result;
        } catch (error) {
            console.error('❌ Failed to get role rewards:', error);
            return [];
        }
    }

    async getRoleRewardsForLevel(guildId, level) {
        try {
            const result = await this.query(`
                SELECT * FROM role_rewards 
                WHERE guild_id = ? AND required_level <= ?
                ORDER BY required_level DESC
            `, [guildId, level]);

            return result;
        } catch (error) {
            console.error('❌ Failed to get role rewards for level:', error);
            return [];
        }
    }

    // Custom Commands System
    async addCustomCommand(guildId, commandName, response, createdBy, createdByUsername, deleteTrigger = false, dmResponse = false) {
        try {
            await this.query(`
                INSERT INTO custom_commands (guild_id, command_name, command_response, created_by, created_by_username, delete_trigger, dm_response)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    command_response = VALUES(command_response),
                    created_by = VALUES(created_by),
                    created_by_username = VALUES(created_by_username),
                    delete_trigger = VALUES(delete_trigger),
                    dm_response = VALUES(dm_response),
                    updated_at = CURRENT_TIMESTAMP
            `, [guildId, commandName.toLowerCase(), response, createdBy, createdByUsername, deleteTrigger, dmResponse]);

            return true;
        } catch (error) {
            console.error('❌ Failed to add custom command:', error);
            return false;
        }
    }

    async getCustomCommand(guildId, commandName) {
        try {
            const result = await this.query(`
                SELECT * FROM custom_commands 
                WHERE guild_id = ? AND command_name = ? AND enabled = TRUE
            `, [guildId, commandName.toLowerCase()]);

            if (result.length > 0) {
                // Increment usage counter
                await this.query(`
                    UPDATE custom_commands 
                    SET uses = uses + 1 
                    WHERE id = ?
                `, [result[0].id]);

                return result[0];
            }

            return null;
        } catch (error) {
            console.error('❌ Failed to get custom command:', error);
            return null;
        }
    }

    async deleteCustomCommand(guildId, commandName) {
        try {
            const result = await this.query(`
                DELETE FROM custom_commands 
                WHERE guild_id = ? AND command_name = ?
            `, [guildId, commandName.toLowerCase()]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('❌ Failed to delete custom command:', error);
            return false;
        }
    }

    async getGuildCustomCommands(guildId) {
        try {
            const result = await this.query(`
                SELECT command_name, uses, created_by_username, created_at 
                FROM custom_commands 
                WHERE guild_id = ? AND enabled = TRUE 
                ORDER BY command_name ASC
            `, [guildId]);

            return result;
        } catch (error) {
            console.error('❌ Failed to get guild custom commands:', error);
            return [];
        }
    }

    // Auto-Moderation Violation Methods
    async logAutoModViolation(guildId, userId, username, violationType, messageContent, channelId, punishmentApplied = null) {
        try {
            const sql = `
                INSERT INTO automod_violations (
                    guild_id, user_id, username, violation_type, 
                    message_content, channel_id, punishment_applied
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            await this.query(sql, [guildId, userId, username, violationType, messageContent, channelId, punishmentApplied]);
        } catch (error) {
            console.error('❌ Failed to log auto-mod violation:', error);
            throw error;
        }
    }

    async getAutoModViolations(guildId, userId, violationType = null, limit = 100) {
        try {
            let sql = `
                SELECT * FROM automod_violations 
                WHERE guild_id = ? AND user_id = ?
            `;
            const params = [guildId, userId];

            if (violationType) {
                sql += ` AND violation_type = ?`;
                params.push(violationType);
            }

            sql += ` ORDER BY created_at DESC LIMIT ?`;
            params.push(limit);

            const result = await this.query(sql, params);
            return result || [];
        } catch (error) {
            console.error('❌ Failed to get auto-mod violations:', error);
            return [];
        }
    }

    async getGuildAutoModViolations(guildId, violationType = null, limit = 100) {
        try {
            let sql = `
                SELECT * FROM automod_violations 
                WHERE guild_id = ?
            `;
            const params = [guildId];

            if (violationType) {
                sql += ` AND violation_type = ?`;
                params.push(violationType);
            }

            sql += ` ORDER BY created_at DESC LIMIT ?`;
            params.push(limit);

            const result = await this.query(sql, params);
            return result || [];
        } catch (error) {
            console.error('❌ Failed to get guild auto-mod violations:', error);
            return [];
        }
    }

    async getUserViolationCount(guildId, userId, violationType = null, timeframe = null) {
        try {
            let sql = `
                SELECT COUNT(*) as count FROM automod_violations 
                WHERE guild_id = ? AND user_id = ?
            `;
            const params = [guildId, userId];

            if (violationType) {
                sql += ` AND violation_type = ?`;
                params.push(violationType);
            }

            if (timeframe) {
                sql += ` AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)`;
                params.push(timeframe);
            }

            const result = await this.query(sql, params);
            return result[0]?.count || 0;
        } catch (error) {
            console.error('❌ Failed to get user violation count:', error);
            return 0;
        }
    }

    async getAutoModStats(guildId, days = 7) {
        try {
            const sql = `
                SELECT 
                    violation_type,
                    COUNT(*) as total_violations,
                    COUNT(DISTINCT user_id) as unique_users,
                    DATE(created_at) as violation_date
                FROM automod_violations 
                WHERE guild_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY violation_type, DATE(created_at)
                ORDER BY violation_date DESC, total_violations DESC
            `;

            const result = await this.query(sql, [guildId, days]);
            return result || [];
        } catch (error) {
            console.error('❌ Failed to get auto-mod stats:', error);
            return [];
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            console.log('📊 Database connection closed');
        }
    }
}

module.exports = DatabaseManager;