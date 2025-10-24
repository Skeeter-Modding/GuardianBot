# 🔒 Guardian Bot - Secure OAuth2 Configuration

## ⚠️ **SECURITY ALERT**

The generated URL you received contains **excessive permissions** that could compromise user privacy and security. 

### ❌ **Problematic Scopes in Generated URL:**
- `guilds.members.read` - Access to private member data
- `email` - User email addresses (unnecessary)
- `dm_channels.read` - Read private messages
- `presences.read` - User activity/status tracking
- `relationships.read` - Friend lists and relationships
- `voice` - Voice channel access
- `messages.read` - Read message content
- And 20+ other unnecessary permissions

## ✅ **Secure URLs for Guardian Bot**

### 🏰 **Guild Install (Add to Servers)**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&permissions=8&scope=bot%20applications.commands
```

**Permissions:**
- ✅ `bot` - Adds bot to server
- ✅ `applications.commands` - Enables slash commands
- ✅ `permissions=8` - Administrator (configurable)

### 👤 **User Install (Personal DMs - 2025 Feature)**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&scope=applications.commands
```

**Permissions:**
- ✅ `applications.commands` - Slash commands only

### 📊 **Dashboard Login (OAuth2 Authentication)**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=identify%20guilds
```

**Permissions:**
- ✅ `identify` - Username, avatar, user ID only
- ✅ `guilds` - List of servers (for management)

## 🛡️ **Security Best Practices**

### **Principle of Least Privilege**
- Only request permissions actually needed
- Avoid broad scopes like `guilds.members.read`
- Never request personal data unless essential

### **Discord Developer Portal Settings**

1. **OAuth2 → General → Redirects:**
   ```
   http://localhost:3000/auth/callback
   ```

2. **Installation → Installation Contexts:**
   - ✅ User Install
   - ✅ Guild Install

3. **Installation → Default Install Settings:**
   - **User Install:** `applications.commands`
   - **Guild Install:** `bot` + `applications.commands`

### **Recommended Bot Permissions (Guild Install)**
For Guardian Bot functionality:
- ✅ Send Messages
- ✅ Manage Messages
- ✅ Manage Channels (for ticket system)
- ✅ View Channels
- ✅ Manage Roles (for ticket permissions)
- ✅ Kick Members (security features)
- ✅ Ban Members (security features)

**Permission Integer:** `8` (Administrator) or specific permissions as needed.

## 🔧 **Implementation**

Guardian Bot uses **minimal scopes** by default:

```javascript
// Clean OAuth2 URLs
const botInviteUrls = {
    guild: `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`,
    user: `https://discord.com/api/oauth2/authorize?client_id=${clientId}&scope=applications.commands`,
    dashboard: `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`
};
```

## 🚨 **What NOT to Include**

### **Privacy-Invasive Scopes:**
- ❌ `email` - User email addresses
- ❌ `guilds.members.read` - Private member data
- ❌ `dm_channels.read` - Private messages
- ❌ `presences.read` - User activity tracking
- ❌ `relationships.read` - Friend lists
- ❌ `messages.read` - Message content access

### **Unnecessary Scopes:**
- ❌ `voice` - Voice channel access
- ❌ `rpc.*` - Rich Presence Control
- ❌ `webhook.incoming` - Webhook management
- ❌ `activities.*` - Activity management
- ❌ `connections` - Connected accounts

## ✅ **Verification**

Your OAuth2 URLs should:
1. **Only include necessary scopes**
2. **Use exact redirect URI from Discord portal**
3. **Follow principle of least privilege**
4. **Be user-friendly and transparent**

## 🔗 **Quick Copy (Secure URLs)**

**Guild Install:**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&permissions=8&scope=bot%20applications.commands
```

**User Install:**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&scope=applications.commands
```

**Dashboard Login:**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=identify%20guilds
```

---

🛡️ **Guardian Bot respects user privacy by requesting only essential permissions.**