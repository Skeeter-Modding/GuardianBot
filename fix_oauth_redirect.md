# 🔧 Discord OAuth2 Redirect URI Fix

## 🚨 Current Problem
You set the redirect URI to: `http://discord.gg/guardianbot`

**This won't work because:**
- ❌ Discord.gg URLs are for server invites, not OAuth2 callbacks
- ❌ No server is running to handle the OAuth2 response
- ❌ Authentication will fail after user authorizes

## 💡 Proper Solutions

### **Option 1: No OAuth2 Dashboard (Recommended)**
If you don't need the web dashboard, disable OAuth2 entirely:

**Discord Portal Settings:**
1. Go to: https://discord.com/developers/applications/1430270570695491704
2. OAuth2 → General → Redirects
3. **Remove all redirect URIs** or set to: `https://discord.com/`
4. Save Changes

**Use Direct Bot Invites:**
- **Guild Install:** https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&permissions=8&scope=bot%20applications.commands
- **User Install:** https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&scope=applications.commands

### **Option 2: Server-Based OAuth2**
If you have a server with Node.js, use proper callback:

**Discord Portal Settings:**
1. OAuth2 → General → Redirects
2. Set to: `http://YOUR_SERVER_IP:3000/auth/callback`
3. Or: `https://yourdomain.com/auth/callback`

**Run on Server:**
```bash
npm install
node dashboard_oauth2.js
```

### **Option 3: Local Development (If Node.js works)**
For local testing with working Node.js:

**Discord Portal Settings:**
1. OAuth2 → General → Redirects  
2. Set to: `http://localhost:3000/auth/callback`

**Run Locally:**
```bash
npm install
node dashboard_oauth2.js
```

## 🎯 Recommended Immediate Fix

Since Node.js/Python don't work locally, use **Option 1**:

1. **Update Discord Portal:**
   - Remove `http://discord.gg/guardianbot`
   - Add `https://discord.com/` (or leave empty)

2. **Use Direct Bot URLs:**
   ```
   Guild: https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&permissions=8&scope=bot%20applications.commands
   
   User: https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&scope=applications.commands
   ```

3. **Bot Features Still Work:**
   - ✅ Slash commands (/ticket, /trump, /kick, /ban)
   - ✅ Ticket system with modals
   - ✅ Trump AI responses  
   - ✅ Skeeter protection
   - ✅ All Discord functionality

## 🔄 Alternative Redirect URIs

If you want to keep OAuth2 for future use:

**Safe Placeholder URLs:**
- `https://discord.com/` (Discord's homepage)
- `https://example.com/callback` (Safe placeholder)
- `https://httpbin.org/get` (Testing endpoint)

**When you get a server:**
- `http://YOUR_SERVER:3000/auth/callback`
- `https://yourdomain.com/auth/callback`

## ⚠️ Important Notes

1. **Discord.gg URLs are ONLY for server invites**
2. **OAuth2 redirect URIs must be actual web endpoints**
3. **Without a running server, OAuth2 dashboard won't work**
4. **Direct bot invites work without OAuth2**

Choose Option 1 for immediate bot functionality!