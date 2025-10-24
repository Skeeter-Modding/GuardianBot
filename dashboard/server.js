// Guardian Bot Dashboard Server
// Enhanced comprehensive dashboard with admin logs and staff ticket management

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const DatabaseManager = require('../src/DatabaseManager');
const config = require('../config.json');

class GuardianDashboard {
    constructor(bot) {
        this.bot = bot;
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server);
        this.port = process.env.PORT || 3000;
        this.db = new DatabaseManager();
        
        this.setupMiddleware();
        this.setupAuthentication();
        this.setupRoutes();
        this.setupWebSocket();
    }

    setupMiddleware() {
        // Session configuration
        this.app.use(session({
            secret: 'guardian-bot-dashboard-secret-2025',
            resave: false,
            saveUninitialized: false,
            cookie: { 
                secure: false, // Set to true for HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }
        }));

        // Passport initialization
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        // View engine setup
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.join(__dirname, 'views'));

        // Serve static files
        this.app.use('/static', express.static(path.join(__dirname, 'public')));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupAuthentication() {
        // Discord OAuth2 Strategy
        passport.use(new DiscordStrategy({
            clientID: config.clientId,
            clientSecret: process.env.DISCORD_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE',
            callbackURL: process.env.NODE_ENV === 'production' 
                ? 'https://guardianbot.my.pebble.host/auth/discord/callback'
                : 'http://localhost:3000/auth/discord/callback',
            scope: ['identify', 'guilds']
        }, async (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }));

        passport.serializeUser((user, done) => {
            done(null, user);
        });

        passport.deserializeUser((user, done) => {
            done(null, user);
        });

        // Legacy API authentication for existing routes
        this.app.use('/api', (req, res, next) => {
            // Skip auth for Discord OAuth routes
            if (req.path.startsWith('/auth')) {
                return next();
            }

            // Check session auth first
            if (req.isAuthenticated && req.isAuthenticated()) {
                return next();
            }

            // Fallback to token auth for API
            const authToken = req.headers.authorization;
            if (!authToken || authToken !== `Bearer ${config.dashboardToken || 'admin123'}`) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            next();
        });
    }

    // Authentication middleware
    requireAuth(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/auth/discord');
    }

    requireOwner(req, res, next) {
        if (req.isAuthenticated() && config.ownerIds.includes(req.user.id)) {
            return next();
        }
        res.status(403).render('error', { 
            title: 'Access Denied',
            message: 'Only bot owners can access this page.',
            user: req.user || null
        });
    }

    async requireStaff(req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/auth/discord');
        }
        
        // Check if user is owner (owners have all permissions)
        if (config.ownerIds.includes(req.user.id)) {
            return next();
        }
        
        // Check if user has staff permissions in any guild
        try {
            const guild = this.bot.client.guilds.cache.first(); // Use first guild for role checking
            if (guild) {
                const member = await guild.members.fetch(req.user.id).catch(() => null);
                if (member && config.adminRoleIds.some(roleId => member.roles.cache.has(roleId))) {
                    return next();
                }
            }
        } catch (error) {
            console.error('Staff check error:', error);
        }
        
        res.status(403).render('error', { 
            title: 'Access Denied',
            message: 'Only staff members can access this page.',
            user: req.user || null
        });
    }

    setupRoutes() {
        // ============= WEB ROUTES =============
        
        // Home page
        this.app.get('/', (req, res) => {
            if (fs.existsSync(path.join(__dirname, 'views', 'index.ejs'))) {
                res.render('index', { 
                    title: 'Guardian Bot Dashboard',
                    user: req.user || null
                });
            } else {
                res.sendFile(path.join(__dirname, 'public', 'index.html'));
            }
        });

        // Authentication routes
        this.app.get('/auth/discord', passport.authenticate('discord'));

        this.app.get('/auth/discord/callback', 
            passport.authenticate('discord', { 
                failureRedirect: '/auth/failed' 
            }), 
            (req, res) => {
                // Check user permissions and redirect accordingly
                if (config.ownerIds.includes(req.user.id)) {
                    res.redirect('/admin');
                } else {
                    res.redirect('/tickets');
                }
            }
        );

        this.app.get('/auth/failed', (req, res) => {
            res.render('error', {
                title: 'Authentication Failed',
                message: 'Discord authentication failed. Please try again.',
                user: null
            });
        });

        this.app.get('/logout', (req, res) => {
            req.logout((err) => {
                if (err) {
                    console.error('Logout error:', err);
                }
                res.redirect('/');
            });
        });

        // Admin dashboard (owner only)
        this.app.get('/admin', this.requireAuth.bind(this), this.requireOwner.bind(this), async (req, res) => {
            try {
                // Get moderation logs from database
                const logs = await this.db.query(`
                    SELECT * FROM moderation_logs 
                    ORDER BY created_at DESC 
                    LIMIT 100
                `).catch(() => []);
                
                // Get ticket statistics
                const ticketStats = await this.db.getTicketStats().catch(() => null);
                
                // Get staff leaderboard
                const staffStats = await this.db.getStaffLeaderboard(10).catch(() => []);
                
                // Get recent Skeeter violations
                const skeeterViolations = await this.db.query(`
                    SELECT * FROM skeeter_protection 
                    ORDER BY created_at DESC 
                    LIMIT 50
                `).catch(() => []);
                
                // Get system stats
                const systemStats = {
                    totalLogs: logs.length,
                    recentViolations: skeeterViolations.length,
                    activeStaff: staffStats.length,
                    uptime: process.uptime(),
                    guilds: this.bot.client.guilds.cache.size,
                    users: this.bot.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
                };
                
                res.render('admin', {
                    title: 'Admin Dashboard',
                    user: req.user,
                    logs: logs,
                    ticketStats: ticketStats,
                    staffStats: staffStats,
                    skeeterViolations: skeeterViolations,
                    systemStats: systemStats
                });
            } catch (error) {
                console.error('Admin dashboard error:', error);
                res.render('error', {
                    title: 'Dashboard Error',
                    message: 'Failed to load admin dashboard data.',
                    user: req.user
                });
            }
        });

        // Staff ticket dashboard
        this.app.get('/tickets', this.requireAuth.bind(this), this.requireStaff.bind(this), async (req, res) => {
            try {
                // Get all tickets from database
                const tickets = await this.db.query(`
                    SELECT * FROM tickets 
                    WHERE status IN ('open', 'claimed') 
                    ORDER BY 
                        CASE priority 
                            WHEN 'high' THEN 1 
                            WHEN 'medium' THEN 2 
                            WHEN 'low' THEN 3 
                        END,
                        created_at ASC
                `).catch(() => []);
                
                // Get user's ticket stats
                const userStats = await this.db.query(`
                    SELECT * FROM staff_stats 
                    WHERE user_id = ? 
                    LIMIT 1
                `, [req.user.id]).catch(() => []);
                
                // Get recent closed tickets for history
                const recentClosed = await this.db.query(`
                    SELECT * FROM tickets 
                    WHERE status = 'closed' 
                    ORDER BY closed_at DESC 
                    LIMIT 20
                `).catch(() => []);
                
                res.render('tickets', {
                    title: 'Ticket Dashboard',
                    user: req.user,
                    tickets: tickets,
                    userStats: userStats[0] || null,
                    recentClosed: recentClosed,
                    isOwner: config.ownerIds.includes(req.user.id)
                });
            } catch (error) {
                console.error('Ticket dashboard error:', error);
                res.render('error', {
                    title: 'Dashboard Error',
                    message: 'Failed to load ticket dashboard data.',
                    user: req.user
                });
            }
        });

        // ============= API ROUTES (Enhanced) =============

        // Legacy status route
        this.app.get('/api/status', (req, res) => {
            this.getStatus(res);
        });

        // Enhanced admin logs API
        this.app.get('/api/admin/logs', this.requireOwner.bind(this), async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 50;
                const offset = parseInt(req.query.offset) || 0;
                const type = req.query.type || '';
                
                let whereClause = '';
                let params = [];
                
                if (type) {
                    whereClause = 'WHERE action_type = ?';
                    params.push(type);
                }
                
                const logs = await this.db.query(`
                    SELECT * FROM moderation_logs 
                    ${whereClause}
                    ORDER BY created_at DESC 
                    LIMIT ? OFFSET ?
                `, [...params, limit, offset]);
                
                res.json({ success: true, logs: logs });
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });

        // Staff ticket API routes
        this.app.get('/api/tickets', this.requireStaff.bind(this), async (req, res) => {
            try {
                const status = req.query.status || 'open,claimed';
                const statusArray = status.split(',');
                const placeholders = statusArray.map(() => '?').join(',');
                
                const tickets = await this.db.query(`
                    SELECT * FROM tickets 
                    WHERE status IN (${placeholders})
                    ORDER BY 
                        CASE priority 
                            WHEN 'high' THEN 1 
                            WHEN 'medium' THEN 2 
                            WHEN 'low' THEN 3 
                        END,
                        created_at ASC
                `, statusArray);
                
                res.json({ success: true, tickets: tickets });
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });

        // Claim ticket
        this.app.post('/api/tickets/:ticketId/claim', this.requireStaff.bind(this), async (req, res) => {
            try {
                const { ticketId } = req.params;
                const success = await this.db.claimTicket(ticketId, req.user.id, req.user.username);
                
                if (success) {
                    // Emit real-time update
                    this.io.emit('ticketUpdate', {
                        action: 'claimed',
                        ticketId: ticketId,
                        claimedBy: req.user.username
                    });
                    
                    res.json({ success: true, message: 'Ticket claimed successfully' });
                } else {
                    res.json({ success: false, error: 'Failed to claim ticket' });
                }
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });

        // Close ticket
        this.app.post('/api/tickets/:ticketId/close', this.requireStaff.bind(this), async (req, res) => {
            try {
                const { ticketId } = req.params;
                const success = await this.db.closeTicket(ticketId, req.user.id, req.user.username);
                
                if (success) {
                    // Emit real-time update
                    this.io.emit('ticketUpdate', {
                        action: 'closed',
                        ticketId: ticketId,
                        closedBy: req.user.username
                    });
                    
                    res.json({ success: true, message: 'Ticket closed successfully' });
                } else {
                    res.json({ success: false, error: 'Failed to close ticket' });
                }
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });

        // ============= LEGACY API ROUTES =============
        this.app.get('/api/stats', (req, res) => {
            this.getStats(res);
        });

        this.app.get('/api/guilds', (req, res) => {
            this.getGuilds(res);
        });

        this.app.post('/api/lockdown/:guildId', (req, res) => {
            this.toggleLockdown(req, res);
        });

        this.app.post('/api/settings', (req, res) => {
            this.updateSettings(req, res);
        });

        this.app.get('/api/logs/:guildId', (req, res) => {
            this.getLogs(req, res);
        });

        this.app.post('/api/emergency-restore/:guildId', (req, res) => {
            this.emergencyRestore(req, res);
        });

        this.app.get('/api/tickets/:guildId', (req, res) => {
            this.getTicketStats(req, res);
        });

        // Error handling
        this.app.use((req, res) => {
            res.status(404).render('error', {
                title: 'Page Not Found',
                message: 'The page you are looking for does not exist.',
                user: req.user || null
            });
        });

        this.app.use((err, req, res, next) => {
            console.error('Dashboard error:', err);
            res.status(500).render('error', {
                title: 'Server Error',
                message: 'An internal server error occurred.',
                user: req.user || null
            });
        });
    }

    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log('Dashboard client connected:', socket.id);
            
            socket.on('disconnect', () => {
                console.log('Dashboard client disconnected:', socket.id);
            });
            
            // Join admin room for owners
            socket.on('joinAdmin', (userId) => {
                if (config.ownerIds.includes(userId)) {
                    socket.join('admin');
                    console.log(`Admin ${userId} joined admin room`);
                }
            });
            
            // Join staff room for staff members
            socket.on('joinStaff', (userId) => {
                socket.join('staff');
                console.log(`Staff ${userId} joined staff room`);
            });
        });
    }

    // ============= LEGACY METHODS =============

    async getStatus(res) {
        try {
            const uptime = process.uptime();
            const memoryUsage = process.memoryUsage();
            
            res.json({
                status: 'online',
                uptime: uptime,
                memory: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
                },
                guilds: this.bot.client.guilds.cache.size,
                users: this.bot.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                botUser: {
                    tag: this.bot.client.user?.tag,
                    id: this.bot.client.user?.id
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getStats(res) {
        try {
            const stats = {
                antiRaid: {
                    enabled: config.antiRaid.enabled,
                    activeMonitoring: this.bot.joinTracker.size,
                    recentJoins: 0
                },
                antiNuke: {
                    enabled: config.antiNuke.enabled,
                    activeMonitoring: this.bot.nukingActions.size
                },
                adminMonitoring: {
                    enabled: config.adminMonitoring.enabled,
                    watchedAdmins: this.bot.adminActions.size,
                    warnings: this.bot.adminWarnings.size
                },
                lockdowns: {
                    active: Array.from(this.bot.lockdownStatus.entries()).filter(([_, status]) => status).length,
                    total: this.bot.lockdownStatus.size
                }
            };

            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getGuilds(res) {
        try {
            const guilds = this.bot.client.guilds.cache.map(guild => ({
                id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                icon: guild.iconURL(),
                isLocked: this.bot.lockdownStatus.get(guild.id) || false,
                channels: guild.channels.cache.size,
                roles: guild.roles.cache.size
            }));

            res.json(guilds);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async toggleLockdown(req, res) {
        try {
            const guildId = req.params.guildId;
            const { action, reason } = req.body;
            
            const guild = this.bot.client.guilds.cache.get(guildId);
            if (!guild) {
                return res.status(404).json({ error: 'Guild not found' });
            }

            if (action === 'lock') {
                await this.bot.lockdownServer(guild, reason || 'Dashboard lockdown');
                res.json({ success: true, message: 'Server locked down', status: 'locked' });
            } else if (action === 'unlock') {
                await this.bot.unlockServer(guild, reason || 'Dashboard unlock');
                res.json({ success: true, message: 'Server unlocked', status: 'unlocked' });
            } else {
                res.status(400).json({ error: 'Invalid action' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateSettings(req, res) {
        try {
            const newConfig = { ...config, ...req.body };
            
            // Write to config file
            fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(newConfig, null, 2));
            
            res.json({ success: true, message: 'Settings updated' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLogs(req, res) {
        try {
            const guildId = req.params.guildId;
            // This would integrate with your logging system
            // For now, return mock data
            const logs = [
                {
                    timestamp: new Date().toISOString(),
                    type: 'info',
                    event: 'Member Join',
                    description: 'User joined the server',
                    details: {}
                }
            ];

            res.json(logs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async emergencyRestore(req, res) {
        try {
            const guildId = req.params.guildId;
            const guild = this.bot.client.guilds.cache.get(guildId);
            
            if (!guild) {
                return res.status(404).json({ error: 'Guild not found' });
            }

            // Perform emergency restore (similar to the slash command)
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
                }
            }

            this.bot.lockdownStatus.set(guild.id, false);

            res.json({
                success: true,
                message: 'Emergency restore completed',
                restored: restoredCount,
                errors: errorCount
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTicketStats(req, res) {
        const { guildId } = req.params;
        
        try {
            const guild = this.bot.client.guilds.cache.get(guildId);
            if (!guild) {
                return res.status(404).json({ error: 'Guild not found' });
            }

            const ticketStats = this.bot.ticketStats || new Map();
            const activeTickets = this.bot.activeTickets || new Map();
            
            // Filter active tickets for this guild
            const guildActiveTickets = Array.from(activeTickets.entries())
                .filter(([channelId]) => guild.channels.cache.has(channelId))
                .map(([channelId, ticket]) => ({
                    channelId,
                    channelName: guild.channels.cache.get(channelId)?.name || 'Unknown',
                    claimedBy: ticket.claimedBy,
                    claimedByName: ticket.claimedBy ? guild.members.cache.get(ticket.claimedBy)?.user.tag || 'Unknown' : null,
                    claimTime: ticket.claimTime,
                    creator: ticket.creator,
                    creatorName: ticket.creator ? guild.members.cache.get(ticket.creator)?.user.tag || 'Unknown' : null
                }));

            // Process staff statistics
            const staffStats = Array.from(ticketStats.entries())
                .map(([userId, stats]) => {
                    const member = guild.members.cache.get(userId);
                    if (!member) return null;
                    
                    const avgResponseTime = stats.responseTime.length > 0 
                        ? stats.responseTime.reduce((a, b) => a + b, 0) / stats.responseTime.length / 60000 // Convert to minutes
                        : 0;
                    
                    return {
                        userId,
                        username: member.user.tag,
                        displayName: member.displayName,
                        claimed: stats.claimed || 0,
                        closed: stats.closed || 0,
                        avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
                        totalResponses: stats.responseTime.length,
                        efficiency: stats.claimed > 0 ? Math.round((stats.closed / stats.claimed) * 100) : 0
                    };
                })
                .filter(stat => stat !== null && (stat.claimed > 0 || stat.closed > 0))
                .sort((a, b) => b.closed - a.closed); // Sort by most tickets closed

            const summary = {
                totalActive: guildActiveTickets.length,
                totalStaff: staffStats.length,
                totalClaimed: staffStats.reduce((sum, stat) => sum + stat.claimed, 0),
                totalClosed: staffStats.reduce((sum, stat) => sum + stat.closed, 0),
                avgResponseTime: staffStats.length > 0 
                    ? Math.round((staffStats.reduce((sum, stat) => sum + stat.avgResponseTime, 0) / staffStats.length) * 10) / 10
                    : 0
            };

            res.json({
                activeTickets: guildActiveTickets,
                staffStats: staffStats,
                summary: summary
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    start() {
        this.server.listen(this.port, async () => {
            try {
                // Connect to database
                await this.db.connect();
                console.log('✅ Dashboard connected to database');
                
                console.log(`🌐 Guardian Bot Dashboard running on port ${this.port}`);
                console.log(`📊 Admin Dashboard: http://localhost:${this.port}/admin`);
                console.log(`🎫 Staff Dashboard: http://localhost:${this.port}/tickets`);
                console.log(`🔐 Authentication: http://localhost:${this.port}/auth/discord`);
                console.log(`📱 Legacy API: http://localhost:${this.port}/api/status`);
            } catch (error) {
                console.error('❌ Failed to connect dashboard to database:', error);
            }
        });
    }

    // Emit real-time updates for admin logs
    emitLogUpdate(logData) {
        this.io.to('admin').emit('newLog', logData);
    }

    // Emit real-time updates for ticket changes
    emitTicketUpdate(updateData) {
        this.io.to('staff').emit('ticketUpdate', updateData);
        this.io.to('admin').emit('ticketUpdate', updateData);
    }
}

module.exports = GuardianDashboard;