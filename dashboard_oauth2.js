const express = require('express');
const session = require('express-session');
const { DiscordOAuth2, createOAuth2Routes } = require('./oauth2');
const config = require('./config.json');

class GuardianDashboard {
    constructor(bot) {
        this.bot = bot;
        this.app = express();
        this.oauth2 = new DiscordOAuth2();
        this.port = 3000;
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Session middleware
        this.app.use(session({
            secret: config.sessionSecret || 'guardian-bot-secret-key',
            resave: false,
            saveUninitialized: false,
            cookie: { 
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                secure: false // Set to true in production with HTTPS
            }
        }));

        this.app.use(express.json());
        this.app.use(express.static('public'));
    }

    setupRoutes() {
        // Create OAuth2 routes
        createOAuth2Routes(this.app, this.oauth2);

        // Home page
        this.app.get('/', (req, res) => {
            const inviteUrls = this.oauth2.getBotInviteUrls();
            
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Guardian Bot - Discord OAuth2</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                            padding: 50px;
                        }
                        .container { 
                            max-width: 800px; 
                            margin: 0 auto; 
                            background: rgba(255,255,255,0.1);
                            padding: 40px;
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                        }
                        .btn { 
                            display: inline-block;
                            background: linear-gradient(45deg, #00ff88, #00d4ff);
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 25px;
                            margin: 10px;
                            font-weight: bold;
                            transition: transform 0.3s ease;
                        }
                        .btn:hover { transform: translateY(-3px); }
                        .invite-section {
                            background: rgba(0,0,0,0.2);
                            padding: 20px;
                            border-radius: 10px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🛡️ Guardian Bot</h1>
                        <p>Modern Discord Bot with OAuth2 Authentication</p>
                        
                        <div class="invite-section">
                            <h2>🚀 Add Guardian Bot to Discord</h2>
                            <a href="${inviteUrls.guild}" class="btn">🏰 Add to Server</a>
                            <a href="${inviteUrls.user}" class="btn">👤 Add for Personal Use</a>
                        </div>
                        
                        <div class="invite-section">
                            <h2>📊 Dashboard Access</h2>
                            <a href="/auth/login" class="btn">🔐 Login with Discord</a>
                            <a href="/dashboard" class="btn">📈 View Dashboard</a>
                        </div>

                        <div class="invite-section">
                            <h2>🎫 Features</h2>
                            <p>✅ Advanced Ticket System with Modals</p>
                            <p>✅ Trump AI Entertainment</p>
                            <p>✅ Skeeter Protection Security</p>
                            <p>✅ User & Guild Installable (2025)</p>
                            <p>✅ OAuth2 Dashboard Authentication</p>
                        </div>
                    </div>
                </body>
                </html>
            `);
        });

        // Protected dashboard route
        this.app.get('/dashboard', this.requireAuth, (req, res) => {
            const user = req.session.user;
            const guilds = req.session.guilds || [];
            
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Guardian Bot Dashboard</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            margin: 0;
                            padding: 20px;
                        }
                        .header {
                            background: rgba(0,0,0,0.3);
                            padding: 20px;
                            border-radius: 10px;
                            margin-bottom: 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .user-info {
                            display: flex;
                            align-items: center;
                            gap: 15px;
                        }
                        .avatar {
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                        }
                        .guild-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                            gap: 20px;
                        }
                        .guild-card {
                            background: rgba(255,255,255,0.1);
                            padding: 20px;
                            border-radius: 10px;
                            backdrop-filter: blur(5px);
                        }
                        .btn {
                            background: #00ff88;
                            color: #333;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                        }
                        .logout-btn {
                            background: #ff4757;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="user-info">
                            <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" 
                                 alt="Avatar" class="avatar">
                            <div>
                                <h2>Welcome, ${user.username}!</h2>
                                <p>Guardian Bot Dashboard</p>
                            </div>
                        </div>
                        <a href="/auth/logout" class="logout-btn">Logout</a>
                    </div>

                    <h2>🏰 Your Servers with Admin Access (${guilds.length})</h2>
                    <div class="guild-grid">
                        ${guilds.map(guild => `
                            <div class="guild-card">
                                <h3>${guild.name}</h3>
                                <p><strong>ID:</strong> ${guild.id}</p>
                                <p><strong>Permissions:</strong> Administrator</p>
                                <a href="/guild/${guild.id}" class="btn">Manage Server</a>
                            </div>
                        `).join('')}
                    </div>

                    ${guilds.length === 0 ? `
                        <div class="guild-card">
                            <h3>No servers found</h3>
                            <p>You don't have admin access to any servers with Guardian Bot.</p>
                            <a href="${this.oauth2.getBotInviteUrls().guild}" class="btn">Add Bot to Server</a>
                        </div>
                    ` : ''}

                    <script>
                        // Auto-refresh every 30 seconds
                        setTimeout(() => location.reload(), 30000);
                    </script>
                </body>
                </html>
            `);
        });

        // API endpoints
        this.app.get('/api/user', this.requireAuth, (req, res) => {
            res.json({
                user: req.session.user,
                guilds: req.session.guilds
            });
        });

        this.app.get('/api/bot/stats', (req, res) => {
            const stats = {
                status: this.bot?.client?.user ? 'online' : 'offline',
                guilds: this.bot?.client?.guilds?.cache?.size || 0,
                users: this.bot?.client?.users?.cache?.size || 0,
                uptime: this.bot?.client?.uptime || 0,
                commands: this.bot?.commands?.size || 0
            };
            
            res.json(stats);
        });
    }

    // Auth middleware
    requireAuth(req, res, next) {
        if (!req.session?.user) {
            return res.redirect('/auth/login');
        }
        
        // Check if token is expired
        if (req.session.tokens?.expires_at < Date.now()) {
            req.session = null;
            return res.redirect('/auth/login');
        }
        
        next();
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🌐 Guardian Bot Dashboard running on http://localhost:${this.port}`);
            console.log(`🔐 OAuth2 Login: http://localhost:${this.port}/auth/login`);
            console.log(`📊 Dashboard: http://localhost:${this.port}/dashboard`);
            console.log(`🚀 Bot Invites: http://localhost:${this.port}/invite`);
        });
    }
}

module.exports = GuardianDashboard;