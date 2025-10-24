# 🔐 Discord Bot OAuth2 Setup Guide (2025)

## 📋 Step 1: Discord Developer Portal Configuration

### 1.1 Create/Access Your Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" or select your existing bot
3. Give it a name (e.g., "Guardian Bot")

### 1.2 Get Your Credentials
Navigate to **General Information** page:
- **Application ID** (Client ID) - Copy this
- **Public Key** - Copy this (for webhook verification)

Navigate to **Bot** page:
- **Token** - Reset and copy this (keep it secret!)

### 1.3 Configure OAuth2 Settings
Go to **OAuth2** → **General**:

**Redirect URLs** - Add these:
```
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

**Scopes** - Select these:
- ✅ `bot` - Bot user permissions
- ✅ `applications.commands` - Slash commands
- ✅ `identify` - User identification
- ✅ `guilds` - Server list access

**Bot Permissions** - Select needed permissions:
- ✅ Send Messages
- ✅ Manage Messages  
- ✅ Manage Channels
- ✅ View Channels
- ✅ Administrator (for full access)

### 1.4 Installation Settings (NEW 2025 Feature)
Go to **Installation** page:

**Installation Contexts:**
- ✅ User Install (works in DMs)
- ✅ Guild Install (works in servers)

**Default Install Settings:**
- **User Install:** `applications.commands`
- **Guild Install:** `bot` + `applications.commands`

## 🔗 Step 2: OAuth2 URLs

### 2.1 Bot Invite URL (Guild Install)
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### 2.2 User Install URL (NEW 2025)
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=applications.commands
```

### 2.3 Dashboard Login URL
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=identify%20guilds
```

## ⚙️ Step 3: Implementation

Replace YOUR_CLIENT_ID with your actual Application ID in all URLs.

## 🎯 Quick Setup

Your OAuth2 URLs will be automatically generated when you run:
```batch
start_2025.bat
```

## 📊 Permissions Explained

| Permission | Purpose |
|------------|---------|
| `bot` | Adds bot to server |
| `applications.commands` | Enables slash commands |
| `identify` | Gets user info for dashboard |
| `guilds` | Lists user's servers |
| `Administrator` | Full server access |

## 🔒 Security Notes

- ✅ Never share your bot token
- ✅ Use HTTPS for production redirects
- ✅ Validate all OAuth2 responses
- ✅ Store tokens securely