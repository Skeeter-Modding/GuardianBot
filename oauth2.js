const express = require('express');
const axios = require('axios');
const config = require('./config.json');

class DiscordOAuth2 {
    constructor() {
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret; // Add this to config.json
        this.redirectUri = config.redirectUri || 'http://localhost:3000/auth/callback';
        
        // Discord OAuth2 endpoints
        this.authUrl = 'https://discord.com/api/oauth2/authorize';
        this.tokenUrl = 'https://discord.com/api/oauth2/token';
        this.userUrl = 'https://discord.com/api/users/@me';
        this.guildsUrl = 'https://discord.com/api/users/@me/guilds';
    }

    // Generate OAuth2 login URL with minimal required scopes
    getAuthUrl(scopes = ['identify', 'guilds']) {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: scopes.join(' ')
        });
        
        return `${this.authUrl}?${params.toString()}`;
    }

    // Generate bot invite URLs (2025 style) with minimal permissions
    getBotInviteUrls() {
        return {
            // Guild install (servers) - only bot and slash commands
            guild: `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&permissions=8&scope=bot%20applications.commands`,
            
            // User install (DMs) - only slash commands for 2025 feature
            user: `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&scope=applications.commands`,
            
            // Dashboard login - only user identification and guild list
            dashboard: this.getAuthUrl(['identify', 'guilds'])
        };
    }

    // Exchange code for access token
    async getAccessToken(code) {
        try {
            const response = await axios.post(this.tokenUrl, 
                new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.redirectUri
                }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Token exchange failed: ${error.response?.data?.error || error.message}`);
        }
    }

    // Get user information
    async getUserInfo(accessToken) {
        try {
            const response = await axios.get(this.userUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to get user info: ${error.response?.data?.error || error.message}`);
        }
    }

    // Get user's guilds
    async getUserGuilds(accessToken) {
        try {
            const response = await axios.get(this.guildsUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to get user guilds: ${error.response?.data?.error || error.message}`);
        }
    }

    // Check if user has admin permissions in guild
    hasAdminPermissions(guild) {
        const adminPermission = 0x8; // Administrator permission
        return (guild.permissions & adminPermission) === adminPermission;
    }

    // Refresh access token
    async refreshToken(refreshToken) {
        try {
            const response = await axios.post(this.tokenUrl,
                new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Token refresh failed: ${error.response?.data?.error || error.message}`);
        }
    }
}

// Express middleware for OAuth2 authentication
function createOAuth2Routes(app, oauth2) {
    // Login route
    app.get('/auth/login', (req, res) => {
        const authUrl = oauth2.getAuthUrl(['identify', 'guilds']);
        res.redirect(authUrl);
    });

    // OAuth2 callback route
    app.get('/auth/callback', async (req, res) => {
        const { code, error } = req.query;

        if (error) {
            return res.status(400).send(`OAuth2 Error: ${error}`);
        }

        if (!code) {
            return res.status(400).send('Missing authorization code');
        }

        try {
            // Exchange code for tokens
            const tokenData = await oauth2.getAccessToken(code);
            
            // Get user info
            const user = await oauth2.getUserInfo(tokenData.access_token);
            
            // Get user's guilds
            const guilds = await oauth2.getUserGuilds(tokenData.access_token);
            
            // Filter guilds where user has admin permissions
            const adminGuilds = guilds.filter(guild => oauth2.hasAdminPermissions(guild));

            // Store user session (you should use proper session storage)
            req.session = {
                user: {
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator,
                    avatar: user.avatar
                },
                guilds: adminGuilds,
                tokens: {
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_at: Date.now() + (tokenData.expires_in * 1000)
                }
            };

            // Redirect to dashboard
            res.redirect('/dashboard');

        } catch (error) {
            res.status(500).send(`Authentication failed: ${error.message}`);
        }
    });

    // Dashboard route (protected)
    app.get('/dashboard', (req, res) => {
        if (!req.session?.user) {
            return res.redirect('/auth/login');
        }

        // Render dashboard with user data
        res.json({
            message: 'Welcome to Guardian Bot Dashboard!',
            user: req.session.user,
            guilds: req.session.guilds,
            botInvites: oauth2.getBotInviteUrls()
        });
    });

    // Logout route
    app.get('/auth/logout', (req, res) => {
        req.session = null;
        res.redirect('/');
    });

    // Bot invite routes
    app.get('/invite', (req, res) => {
        const urls = oauth2.getBotInviteUrls();
        res.json({
            message: 'Guardian Bot Invite Links',
            invites: urls,
            note: 'Choose "guild" for servers or "user" for personal DM use'
        });
    });
}

module.exports = { DiscordOAuth2, createOAuth2Routes };