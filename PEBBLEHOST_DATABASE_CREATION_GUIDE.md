# 🔍 How to Create MySQL Database & User on PebbleHost

## 📊 **Step-by-Step Database Creation**

### **Method 1: Modern PebbleHost Panel**

1. **Login** to your PebbleHost control panel
2. **Look for** one of these sections:
   - `Databases`
   - `MySQL Databases` 
   - `Database Management`
   - `Tools` → `Databases`

3. **Create Database**:
   - Click `Create Database` or `Add Database`
   - **Database Name**: Enter `guardian_bot_db`
   - The full name will be: `username_guardian_bot_db`

4. **Create Database User**:
   - Click `Create User` or `Add User`
   - **Username**: Enter `guardian_user`
   - **Password**: Enter a strong password (save this!)
   - The full username will be: `username_guardian_user`

5. **Assign User to Database**:
   - Click `Add User to Database`
   - Select your database and user
   - Grant `ALL PRIVILEGES`

### **Method 2: cPanel Style Interface**

If you see a cPanel-style interface:

1. **MySQL Databases** section
2. **Create New Database**:
   - Database Name: `guardian_bot_db`
3. **MySQL Users** section:
   - Username: `guardian_user`
   - Password: (your choice)
4. **Add User to Database**:
   - Select database and user
   - Check "ALL PRIVILEGES"

### **Method 3: phpMyAdmin Access**

Some PebbleHost accounts provide phpMyAdmin:

1. Look for `phpMyAdmin` link in control panel
2. Login with your main account
3. Create database and user through phpMyAdmin interface

## 🔍 **What to Look For**

### **Common Section Names:**
- 📊 "Databases"
- 🗄️ "MySQL Databases"
- 🔧 "Database Management"
- 🛠️ "Tools" → "Databases"
- 📈 "phpMyAdmin"

### **Common Button Names:**
- "Create Database"
- "Add Database"
- "New Database"
- "Create MySQL Database"

## 📝 **Expected Database Details**

After creation, you should get:

### **Database Info:**
- **Host**: `na05-sql.pebblehost.com`
- **Port**: `3306`
- **Database Name**: `youraccount_guardian_bot_db`
- **Username**: `youraccount_guardian_user`
- **Password**: (what you set)

## 🤔 **Can't Find Database Section?**

### **Try These Steps:**

1. **Check Account Type**:
   - Some basic plans don't include MySQL
   - Verify your plan includes database access

2. **Look in Different Areas**:
   - Main dashboard
   - "Services" section
   - "Additional Services"
   - "Add-ons"

3. **Contact PebbleHost**:
   - Submit support ticket
   - Ask: "How do I create a MySQL database?"
   - They'll guide you to the right section

## 🆘 **Alternative: Contact Support**

If you can't locate the database creation area:

### **Support Ticket Template:**
```
Subject: Need Help Creating MySQL Database

Hi PebbleHost Support,

I need to create a MySQL database for my Discord bot. 

Could you please:
1. Show me where to create MySQL databases in my control panel
2. Create a database called "guardian_bot_db" 
3. Create a user called "guardian_user"
4. Provide the connection details

My server: na05-sql.pebblehost.com

Thank you!
```

## 📸 **Screenshot Locations**

Take screenshots of your control panel and I can help identify where to create the database. Look for any section mentioning:
- "Database"
- "MySQL" 
- "SQL"
- "phpMyAdmin"

## 🎯 **Once You Find It**

When you locate the database creation area, you'll need:

1. **Database Name**: `guardian_bot_db`
2. **Username**: `guardian_user`  
3. **Password**: (your choice - make it strong!)

Then update your config.json:
```json
{
  "database": {
    "enabled": true,
    "host": "na05-sql.pebblehost.com",
    "port": 3306,
    "user": "youraccount_guardian_user",
    "password": "your_chosen_password",
    "database": "youraccount_guardian_bot_db",
    "connectionLimit": 10,
    "ssl": false
  }
}
```

**Let me know what sections you see in your PebbleHost panel and I'll help you find the right area!** 🔍

## 🚀 **Quick Check**

Can you see any of these in your control panel?
- [ ] "Databases" section
- [ ] "MySQL" anywhere
- [ ] "phpMyAdmin" link
- [ ] "Tools" menu
- [ ] "Services" section

**Share what you see and I'll guide you to the database creation!** 🗄️