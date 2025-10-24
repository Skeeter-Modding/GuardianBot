from fastapi import FastAPI, Request, HTTPException, Depends, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import json
import asyncio
import datetime
from typing import Optional, Dict, Any
import secrets
import uvicorn
from pathlib import Path

# Load configuration
with open('config.json', 'r') as f:
    config = json.load(f)

app = FastAPI(title="Guardian Bot Dashboard", description="Discord Bot Management Dashboard")
security = HTTPBasic()
templates = Jinja2Templates(directory="templates")

# Create static and templates directories
Path("static").mkdir(exist_ok=True)
Path("templates").mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Global bot data storage
bot_data = {
    "status": "offline",
    "guilds": [],
    "stats": {
        "total_tickets": 0,
        "active_tickets": 0,
        "staff_online": 0,
        "total_members": 0
    },
    "active_tickets": {},
    "ticket_stats": {},
    "lockdown_guilds": set()
}

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify dashboard credentials"""
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, config.get("dashboardToken", "admin123"))
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.get("/", response_class=HTMLResponse)
async def dashboard_home(request: Request, username: str = Depends(verify_credentials)):
    """Main dashboard page"""
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "bot_data": bot_data,
        "title": "Guardian Bot Dashboard"
    })

@app.get("/tickets", response_class=HTMLResponse)
async def tickets_page(request: Request, username: str = Depends(verify_credentials)):
    """Ticket statistics page"""
    return templates.TemplateResponse("tickets.html", {
        "request": request,
        "bot_data": bot_data,
        "title": "Ticket Statistics"
    })

@app.get("/api/status")
async def get_status(username: str = Depends(verify_credentials)):
    """Get bot status"""
    return {
        "status": bot_data["status"],
        "uptime": "Online" if bot_data["status"] == "online" else "Offline",
        "guilds": len(bot_data["guilds"]),
        "users": bot_data["stats"]["total_members"]
    }

@app.get("/api/stats")
async def get_stats(username: str = Depends(verify_credentials)):
    """Get bot statistics"""
    return bot_data["stats"]

@app.get("/api/guilds")
async def get_guilds(username: str = Depends(verify_credentials)):
    """Get guild information"""
    return bot_data["guilds"]

@app.get("/api/tickets/{guild_id}")
async def get_tickets(guild_id: str, username: str = Depends(verify_credentials)):
    """Get ticket statistics for a guild"""
    
    # Filter active tickets for this guild (simulated)
    guild_tickets = [
        {
            "channelId": ticket_id,
            "channelName": f"ticket-{ticket['creator']}-{ticket_id[-6:]}",
            "claimedBy": ticket.get("claimed_by"),
            "claimedByName": f"Staff Member {ticket.get('claimed_by', 'None')[-4:]}" if ticket.get("claimed_by") else None,
            "creator": ticket["creator"],
            "creatorName": f"User {ticket['creator'][-4:]}",
            "priority": ticket.get("priority", "medium"),
            "status": ticket.get("status", "open")
        }
        for ticket_id, ticket in bot_data["active_tickets"].items()
    ]
    
    # Process staff statistics
    staff_stats = []
    for staff_id, stats in bot_data["ticket_stats"].items():
        avg_response = sum(stats.get("response_times", [])) / len(stats.get("response_times", [1])) if stats.get("response_times") else 0
        efficiency = (stats.get("closed", 0) / max(stats.get("claimed", 1), 1)) * 100
        
        staff_stats.append({
            "userId": staff_id,
            "username": f"Staff{staff_id[-4:]}",
            "displayName": f"Staff Member {staff_id[-4:]}",
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

@app.post("/api/lockdown/{guild_id}")
async def toggle_lockdown(guild_id: str, username: str = Depends(verify_credentials)):
    """Toggle guild lockdown"""
    if guild_id in bot_data["lockdown_guilds"]:
        bot_data["lockdown_guilds"].discard(guild_id)
        status = "unlocked"
    else:
        bot_data["lockdown_guilds"].add(guild_id)
        status = "locked"
    
    return {"success": True, "status": status, "guild_id": guild_id}

@app.post("/api/emergency-restore/{guild_id}")
async def emergency_restore(guild_id: str, username: str = Depends(verify_credentials)):
    """Emergency restore permissions"""
    # Simulate emergency restore
    bot_data["lockdown_guilds"].discard(guild_id)
    
    return {
        "success": True,
        "message": "Emergency restore completed",
        "restored": 15,  # Simulated restored channels
        "errors": 0
    }

# Bot data update endpoint (called by the Discord bot)
@app.post("/api/update-bot-data")
async def update_bot_data(data: Dict[Any, Any]):
    """Update bot data from Discord bot"""
    bot_data.update(data)
    return {"success": True}

if __name__ == "__main__":
    print("🌐 Starting Guardian Bot Dashboard...")
    print("📊 Dashboard URL: http://localhost:8000")
    print("🔑 Username: admin")
    print(f"🔑 Password: {config.get('dashboardToken', 'admin123')}")
    print("🎫 Ticket System: Ready")
    print("🤖 Trump AI: Loaded")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)