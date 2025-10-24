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
                ssl: config.database.ssl,
                acquireTimeout: 60000,
                timeout: 60000,
                reconnect: true
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

            // Create skeeter protection table
            await this.query(`
                CREATE TABLE IF NOT EXISTS skeeter_protection (
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

            // Create warnings table
            await this.query(`
                CREATE TABLE IF NOT EXISTS warnings (
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
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_guild_id (guild_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_moderator_id (moderator_id),
                    INDEX idx_is_active (is_active),
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

    // Skeeter Protection
    async logSkeeterViolation(guildId, userId, username, violationType, messageContent = null, actionTaken = null) {
        try {
            const sql = `
                INSERT INTO skeeter_protection (
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
            console.error('❌ Failed to log Skeeter violation:', error);
            return false;
        }
    }

    // Warning System
    async addWarning(guildId, userId, username, moderatorId, moderatorUsername, reason) {
        try {
            const sql = `
                INSERT INTO warnings (
                    guild_id, user_id, username, moderator_id, moderator_username, reason
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const result = await this.query(sql, [guildId, userId, username, moderatorId, moderatorUsername, reason]);
            return result.insertId;
        } catch (error) {
            console.error('❌ Failed to add warning:', error);
            return null;
        }
    }

    async getUserWarnings(guildId, userId, activeOnly = true) {
        try {
            const sql = `
                SELECT * FROM warnings 
                WHERE guild_id = ? AND user_id = ? ${activeOnly ? 'AND is_active = TRUE' : ''}
                ORDER BY created_at DESC
            `;
            
            return await this.query(sql, [guildId, userId]);
        } catch (error) {
            console.error('❌ Failed to get user warnings:', error);
            return [];
        }
    }

    async getWarningById(warningId, guildId) {
        try {
            const sql = `SELECT * FROM warnings WHERE id = ? AND guild_id = ? LIMIT 1`;
            const results = await this.query(sql, [warningId, guildId]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('❌ Failed to get warning by ID:', error);
            return null;
        }
    }

    async removeWarning(warningId, guildId, removedBy, removedByUsername, removalReason = null) {
        try {
            const sql = `
                UPDATE warnings 
                SET is_active = FALSE, removed_by = ?, removed_by_username = ?, 
                    removed_at = NOW(), removal_reason = ?
                WHERE id = ? AND guild_id = ? AND is_active = TRUE
            `;
            
            const result = await this.query(sql, [removedBy, removedByUsername, removalReason, warningId, guildId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('❌ Failed to remove warning:', error);
            return false;
        }
    }

    async getWarningStats(guildId) {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_warnings,
                    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_warnings,
                    COUNT(CASE WHEN is_active = FALSE THEN 1 END) as removed_warnings,
                    COUNT(DISTINCT user_id) as warned_users,
                    COUNT(DISTINCT moderator_id) as moderators_who_warned
                FROM warnings 
                WHERE guild_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `;
            
            const results = await this.query(sql, [guildId]);
            return results[0];
        } catch (error) {
            console.error('❌ Failed to get warning stats:', error);
            return null;
        }
    }

    async getUserWarningCount(guildId, userId, activeOnly = true) {
        try {
            const sql = `
                SELECT COUNT(*) as warning_count 
                FROM warnings 
                WHERE guild_id = ? AND user_id = ? ${activeOnly ? 'AND is_active = TRUE' : ''}
            `;
            
            const results = await this.query(sql, [guildId, userId]);
            return results[0].warning_count;
        } catch (error) {
            console.error('❌ Failed to get user warning count:', error);
            return 0;
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