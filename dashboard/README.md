# Guardian Bot Dashboard

This is the React-based web dashboard for the Guardian Bot, providing a user-friendly interface to manage your Discord server's bot features.

## Features

- 🔐 **Discord OAuth2 Authentication** - Secure login with your Discord account
- 👥 **Multi-Server Management** - Manage multiple Discord servers from one dashboard
- 📊 **Real-time Statistics** - View member counts, leveling stats, and server activity
- ⚙️ **Feature Configuration** - Toggle and configure bot features per server
- 🔒 **Permission-Based Access** - Only see servers where you have admin permissions
- 🌙 **Light/Dark Theme** - Modern UI with theme support
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Technology Stack

- **React 18** - Modern React with hooks
- **Vite 3** - Fast build tool and dev server
- **Chakra UI 2.0** - Component library for beautiful UI
- **TypeScript** - Type-safe code
- **React Router** - Client-side routing
- **i18n** - Multi-language support

## Dashboard Pages

- **Home** - Overview and server selection
- **Leveling** - Configure leveling system and view leaderboards
- **Auto-Moderation** - Set up auto-mod rules and filters
- **Security** - Configure anti-nuke, anti-raid, and lockdown features
- **Role Logging** - View role change history
- **Moderation** - View and manage warnings, kicks, bans
- **Settings** - Server-specific bot configuration

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Configuration

The dashboard connects to the backend API server (dashboard-server.js) which runs on port 3000. Make sure:

1. The bot is running with `dashboard.initialize(client)` called
2. Discord OAuth2 credentials are configured in `config.json`
3. The redirect URI is set to `http://localhost:3000/auth/callback` (or your domain)

## Authentication Flow

1. User clicks "Login with Discord"
2. Dashboard redirects to Discord OAuth2
3. User authorizes the application
4. Discord redirects back to `/auth/callback`
5. Backend validates the OAuth code and creates a session
6. User is logged in and can access their servers

## API Endpoints

The dashboard communicates with these backend endpoints:

- `GET /auth/discord` - Get Discord OAuth URL
- `GET /auth/callback` - Handle OAuth callback
- `GET /auth/check` - Check login status
- `GET /api/servers` - Get user's servers
- `GET /api/server/:id/*` - Server-specific data
- `POST /api/server/:id/*` - Update server settings

## Important Notes

- The dashboard requires the bot to be running to function
- Only users with admin permissions in a server can manage it
- Bot owner (configured in `config.json`) has full access to all servers
- All API requests are authenticated via session tokens

## Support

For issues or questions, contact the bot owner or refer to the main README.md in the project root.
