from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import datetime
from pathlib import Path

app = FastAPI(title="Guardian Bot Demo Dashboard")
templates = Jinja2Templates(directory="templates")

# Create directories if they don't exist
Path("static").mkdir(exist_ok=True)

# Demo data
demo_data = {
    "status": "online",
    "guilds": [
        {"id": "123456789", "name": "Awesome Discord Server", "memberCount": 1247, "channels": 25, "roles": 8},
        {"id": "987654321", "name": "Gaming Community", "memberCount": 892, "channels": 18, "roles": 12},
        {"id": "456789123", "name": "Tech Support Hub", "memberCount": 2156, "channels": 32, "roles": 15}
    ],
    "stats": {
        "total_tickets": 47,
        "active_tickets": 8,
        "staff_online": 5,
        "total_members": 4295
    },
    "active_tickets": {
        "001": {"creator": "user123", "subject": "Login Issues", "priority": "high", "claimed_by": "staff001", "status": "claimed"},
        "002": {"creator": "user456", "subject": "Account Recovery", "priority": "medium", "claimed_by": None, "status": "open"},
        "003": {"creator": "user789", "subject": "Feature Request", "priority": "low", "claimed_by": "staff002", "status": "claimed"},
        "004": {"creator": "user101", "subject": "Bug Report", "priority": "high", "claimed_by": "staff001", "status": "claimed"},
        "005": {"creator": "user202", "subject": "General Question", "priority": "medium", "claimed_by": None, "status": "open"}
    },
    "ticket_stats": {
        "staff001": {"claimed": 15, "closed": 12, "response_times": [480, 720, 360, 600, 540]},
        "staff002": {"claimed": 12, "closed": 10, "response_times": [900, 1200, 600, 840, 780]},
        "staff003": {"claimed": 8, "closed": 6, "response_times": [1320, 1800, 960, 1440, 1080]},
        "staff004": {"claimed": 6, "closed": 5, "response_times": [600, 480, 720, 540, 660]},
        "staff005": {"claimed": 6, "closed": 4, "response_times": [1500, 1080, 900, 1200, 1350]}
    }
}

@app.get("/", response_class=HTMLResponse)
async def dashboard_home(request: Request):
    """Demo dashboard page"""
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "bot_data": demo_data,
        "title": "Guardian Bot Demo Dashboard"
    })

@app.get("/tickets", response_class=HTMLResponse)
async def tickets_page(request: Request):
    """Demo ticket statistics page"""
    return templates.TemplateResponse("tickets.html", {
        "request": request,
        "bot_data": demo_data,
        "title": "Guardian Bot Demo - Ticket Statistics"
    })

@app.get("/api/status")
async def get_status():
    """Get demo bot status"""
    return {
        "status": demo_data["status"],
        "uptime": "Online (Demo Mode)",
        "guilds": len(demo_data["guilds"]),
        "users": demo_data["stats"]["total_members"]
    }

@app.get("/api/stats")
async def get_stats():
    """Get demo bot statistics"""
    return demo_data["stats"]

@app.get("/api/guilds")
async def get_guilds():
    """Get demo guild information"""
    return demo_data["guilds"]

@app.get("/api/tickets/{guild_id}")
async def get_tickets(guild_id: str):
    """Get demo ticket statistics"""
    
    # Generate demo active tickets
    guild_tickets = [
        {
            "channelId": ticket_id,
            "channelName": f"ticket-{ticket['creator']}-{ticket_id}",
            "claimedBy": ticket.get("claimed_by"),
            "claimedByName": f"Staff Alpha" if ticket.get("claimed_by") == "staff001" else f"Staff Beta" if ticket.get("claimed_by") == "staff002" else "Unclaimed",
            "creator": ticket["creator"],
            "creatorName": f"User{ticket['creator'][-3:]}",
            "priority": ticket.get("priority", "medium"),
            "status": ticket.get("status", "open")
        }
        for ticket_id, ticket in demo_data["active_tickets"].items()
    ]
    
    # Generate demo staff statistics
    staff_names = ["Staff Alpha", "Staff Beta", "Staff Charlie", "Staff Delta", "Staff Echo"]
    staff_stats = []
    
    for i, (staff_id, stats) in enumerate(demo_data["ticket_stats"].items()):
        avg_response = sum(stats.get("response_times", [])) / len(stats.get("response_times", [1])) if stats.get("response_times") else 0
        efficiency = (stats.get("closed", 0) / max(stats.get("claimed", 1), 1)) * 100
        
        staff_stats.append({
            "userId": staff_id,
            "username": staff_names[i] if i < len(staff_names) else f"Staff{i+1}",
            "displayName": staff_names[i] if i < len(staff_names) else f"Staff Member {i+1}",
            "claimed": stats.get("claimed", 0),
            "closed": stats.get("closed", 0),
            "avgResponseTime": round(avg_response / 60, 1),  # Convert to minutes
            "efficiency": round(efficiency)
        })
    
    staff_stats.sort(key=lambda x: x["closed"], reverse=True)
    
    return {
        "activeTickets": guild_tickets,
        "staffStats": staff_stats,
        "summary": {
            "totalActive": len(guild_tickets),
            "totalStaff": len(staff_stats),
            "totalClaimed": sum(s["claimed"] for s in staff_stats),
            "totalClosed": sum(s["closed"] for s in staff_stats),
            "avgResponseTime": round(sum(s["avgResponseTime"] for s in staff_stats) / max(len(staff_stats), 1), 1)
        }
    }

@app.get("/api/demo-info")
async def demo_info():
    """Demo information endpoint"""
    return {
        "mode": "demo",
        "message": "This is a demo version of the Guardian Bot Dashboard",
        "features": [
            "🎫 Ticket System Interface",
            "📊 Performance Analytics",
            "🏆 Staff Leaderboards", 
            "📈 Real-time Statistics",
            "🎭 Trump AI Integration",
            "🛡️ Security Management"
        ],
        "note": "To use with real Discord bot, install Python and configure bot token"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 GUARDIAN BOT DEMO DASHBOARD")
    print("=" * 40)
    print("🎫 Ticket System: Demo Mode")
    print("📊 Dashboard: http://localhost:8000")
    print("🎭 Trump AI: Loaded")
    print("💡 This is a demonstration of the interface")
    print("=" * 40)
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except ImportError:
        print("❌ uvicorn not available")
        print("📦 Install with: pip install uvicorn fastapi jinja2")
        input("Press Enter to exit...")