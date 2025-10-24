# 🔧 Discord Developer Portal OAuth2 Configuration Guide

## 📋 **Problem: Discord's OAuth2 Generator Adds Too Many Scopes**

When you use Discord Developer Portal's OAuth2 URL Generator, it automatically includes **ALL available scopes**, which creates security and privacy concerns.

## ✅ **How to Configure Discord Portal Properly**

### **Step 1: Go to Your Application**
```
https://discord.com/developers/applications/1430270570695491704
```

### **Step 2: Configure OAuth2 Settings**

#### **OAuth2 → General**
1. **Redirects:** Add only what you need:
   ```
   http://localhost:3000/auth/callback
   ```

2. **Default Authorization Link** - Don't use this! It includes all scopes.

#### **OAuth2 → URL Generator** 
**⚠️ DO NOT USE THE URL GENERATOR** - It selects all scopes by default.

### **Step 3: Configure Installation Settings (NEW 2025)**

#### **Installation → Installation Contexts**
- ✅ **User Install** 
- ✅ **Guild Install**

#### **Installation → Default Install Settings**

**For User Install:**
- Scopes: `applications.commands` only
- No additional permissions needed

**For Guild Install:**  
- Scopes: `bot` + `applications.commands`
- Bot Permissions: Select only what Guardian Bot needs:
  - ✅ Send Messages
  - ✅ Manage Messages
  - ✅ Manage Channels
  - ✅ View Channels
  - ✅ Manage Roles
  - ✅ Kick Members
  - ✅ Ban Members
  - ✅ Administrator (or specific permissions)

### **Step 4: Get Your Install Links**

#### **From Installation Page:**
Discord will generate clean install links automatically:

**Default Install Link** (shows both User and Guild options):
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704
```

This link will show users options for:
- "Add to Server" (Guild Install)
- "Add to your apps" (User Install)

#### **Manual Clean URLs:**
**Guild Install (Servers):**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&permissions=8&scope=bot%20applications.commands
```

**User Install (Personal):**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&scope=applications.commands
```

**Dashboard Login (OAuth2):**
```
https://discord.com/api/oauth2/authorize?client_id=1430270570695491704&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=identify%20guilds
```

## 🚨 **Why Discord's URL Generator is Problematic**

### **What Discord's Generator Includes:**
```
scope=identify+connections+guilds+guilds.join+guilds.members.read+guilds.channels.read+gdm.join+bot+rpc+rpc.notifications.read+rpc.voice.read+rpc.voice.write+rpc.video.read+rpc.video.write+rpc.screenshare.read+rpc.screenshare.write+email+rpc.activities.write+webhook.incoming+messages.read+applications.builds.upload+applications.builds.read+applications.commands+applications.store.update+applications.entitlements+activities.read+activities.write+activities.invites.write+relationships.read+relationships.write+voice+dm_channels.read+role_connections.write+presences.read+presences.write+openid+dm_channels.messages.read+dm_channels.messages.write+gateway.connect+account.global_name.update+payment_sources.country_code+sdk.social_layer_presence+sdk.social_layer+lobbies.write+application_identities.write+applications.commands.permissions.update
```

### **What Guardian Bot Actually Needs:**
```
scope=bot%20applications.commands  (for guild install)
scope=applications.commands        (for user install)  
scope=identify%20guilds           (for dashboard login)
```

## 🛡️ **Security Best Practices**

### **Don't Use Discord's URL Generator For:**
- ❌ Production bot invites
- ❌ Public distribution
- ❌ User-facing links

### **Do Use Discord's Installation Settings:**
- ✅ Configure Installation Contexts
- ✅ Set Default Install Settings  
- ✅ Use the clean Default Install Link
- ✅ Manually craft specific OAuth2 URLs

### **Why This Matters:**
- **Privacy:** Users see exactly what permissions you're requesting
- **Trust:** Clean permissions build user confidence
- **Security:** Minimal permissions reduce attack surface
- **Compliance:** Follows Discord's best practices

## 📋 **Discord Portal Configuration Checklist**

- [ ] Added redirect URI: `http://localhost:3000/auth/callback`
- [ ] Enabled User Install context
- [ ] Enabled Guild Install context  
- [ ] Set User Install scope: `applications.commands`
- [ ] Set Guild Install scopes: `bot` + `applications.commands`
- [ ] Selected minimal bot permissions
- [ ] **AVOIDED using OAuth2 URL Generator**
- [ ] Used clean manual URLs or Default Install Link

## 🎯 **Recommended Approach**

1. **Configure Installation Settings properly**
2. **Use the Default Install Link from Installation page**
3. **Or use manually crafted clean URLs**
4. **Never use the OAuth2 URL Generator for production**

The Default Install Link from the Installation page will automatically show users appropriate options based on your configuration, without the excessive scopes from the URL Generator.