@echo off
title Guardian Bot - Admin & Discord Moderator Role Setup
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║              🛡️ ADMIN & DISCORD MODERATOR ROLE SETUP               ║
echo ║                        Ticket System Access                       ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 ROLE-BASED TICKET PERMISSIONS UPDATED!
echo.
echo ✅ The following roles can now VIEW, CLAIM, and ANSWER TICKETS:
echo.

echo 📋 AUTOMATIC ROLE DETECTION:
echo    • 👑 Bot Owner ^(from config.json^)
echo    • ⚡ Administrator ^(Discord permission^)
echo    • 🛡️ Server Admin ^(configured role IDs^)
echo    • 🔧 Admin ^(role named "Admin"^)
echo    • 🚨 Discord Moderator ^(role named "Discord Moderator"^)
echo.

echo 🔍 ROLE NAME VARIATIONS SUPPORTED:
echo    • "Admin"
echo    • "admin" 
echo    • "ADMIN"
echo    • "Discord Moderator"
echo    • "discord moderator"
echo    • "DISCORD MODERATOR"
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        ⚙️ HOW IT WORKS                             ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🎫 TICKET CREATION:
echo    • Users with "Admin" or "Discord Moderator" roles automatically get access
echo    • Ticket channels grant VIEW, SEND, MANAGE permissions to these roles
echo    • No need to manually configure role IDs for these common role names
echo.

echo 🎯 TICKET CLAIMING:
echo    • /claim-ticket command now works for Admin and Discord Moderator roles
echo    • Claims show the specific role type ^(e.g., "🔧 Admin ^(Admin^)"^)
echo    • Full logging includes role information
echo.

echo 🔒 TICKET CLOSING:
echo    • /close-ticket command works for Admin and Discord Moderator roles
echo    • Closure messages show role type and permissions
echo    • Statistics tracked per staff member
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        📊 ROLE HIERARCHY                           ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 1. 👑 Bot Owner ^(highest^)
echo 2. ⚡ Administrator Permission
echo 3. 🛡️ Configured Admin Roles ^(config.json^)
echo 4. 🔧 "Admin" Role ^(by name^)
echo 5. 🚨 "Discord Moderator" Role ^(by name^)
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        🧪 TESTING INSTRUCTIONS                     ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 📝 TO TEST THE NEW PERMISSIONS:
echo.
echo 1. Create roles named "Admin" and/or "Discord Moderator" in your server
echo 2. Assign these roles to users who should handle tickets
echo 3. Have a regular user create a ticket with /ticket
echo 4. Users with Admin/Discord Moderator roles should be able to:
echo    • View the ticket channel
echo    • Use /claim-ticket to claim it
echo    • Respond to the ticket
echo    • Use /close-ticket to close it
echo.

echo 🔍 VERIFICATION:
echo    • Check ticket channel permissions ^(Admin/Discord Moderator should have access^)
echo    • Test /claim-ticket with Admin role users
echo    • Test /close-ticket with Discord Moderator role users
echo    • Check logs for role type information
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                        ⚠️ IMPORTANT NOTES                          ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 📌 ROLE NAMES MUST MATCH EXACTLY:
echo    • Case-insensitive ^("Admin", "admin", "ADMIN" all work^)
echo    • Exact spelling required
echo    • "Administrator" ≠ "Admin"
echo    • "Moderator" ≠ "Discord Moderator"
echo.

echo 🔧 CONFIGURATION:
echo    • Existing config.json role IDs still work
echo    • New role detection is IN ADDITION to configured roles
echo    • No changes needed to existing setup
echo.

echo 🚀 DEPLOYMENT:
echo    • Changes are active immediately
echo    • Restart bot if needed: launch_configured.bat
echo    • Test with different role combinations
echo.

echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                           ✅ SETUP COMPLETE                         ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 Admin and Discord Moderator roles now have full ticket access!
echo 🛡️ Guardian Bot ticket system enhanced with role-based permissions
echo 🔧 Ready for immediate use - no additional configuration required
echo.

pause