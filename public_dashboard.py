from fastapi import FastAPI, Request, HTTPException, Depends, Form, Query
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import datetime
from typing import Optional, Dict, Any
import secrets
import uvicorn
from pathlib import Path
import os

# Load configuration
with open('config.json', 'r') as f:
    config = json.load(f)

app = FastAPI(
    title="Guardian Bot Public Dashboard", 
    description="Public Discord Bot Dashboard - guardianbot.discord.gg",
    version="2.0.0"
)

# CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBasic()
templates = Jinja2Templates(directory="templates")

# Create directories
Path("static").mkdir(exist_ok=True)
Path("templates").mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Global bot data storage
bot_data = {
    "status": "online",
    "guilds": [],
    "total_tickets": 1247,
    "active_tickets": 23,
    "resolved_tickets": 1224,
    "users_helped": 892,
    "uptime": "99.9%",
    "trump_responses": 3421,
    "skeeter_protections": 156
}

# Public statistics (no auth required)
@app.get("/", response_class=HTMLResponse)
async def public_dashboard(request: Request):
    """Public dashboard accessible without authentication"""
    return templates.TemplateResponse("public_dashboard.html", {
        "request": request,
        "bot_status": bot_data["status"],
        "total_tickets": bot_data["total_tickets"],
        "active_tickets": bot_data["active_tickets"],
        "resolved_tickets": bot_data["resolved_tickets"],
        "users_helped": bot_data["users_helped"],
        "uptime": bot_data["uptime"],
        "trump_responses": bot_data["trump_responses"],
        "skeeter_protections": bot_data["skeeter_protections"]
    })

@app.get("/api/stats")
async def get_public_stats():
    """Public API endpoint for bot statistics"""
    return {
        "status": bot_data["status"],
        "total_tickets": bot_data["total_tickets"],
        "active_tickets": bot_data["active_tickets"],
        "resolved_tickets": bot_data["resolved_tickets"],
        "users_helped": bot_data["users_helped"],
        "uptime": bot_data["uptime"],
        "trump_responses": bot_data["trump_responses"],
        "skeeter_protections": bot_data["skeeter_protections"],
        "last_updated": datetime.datetime.now().isoformat()
    }

@app.get("/invite")
async def invite_bot():
    """Redirect to Discord bot invite link"""
    invite_url = f"https://discord.com/api/oauth2/authorize?client_id={config.get('clientId', 'YOUR_CLIENT_ID')}&permissions=8&scope=bot%20applications.commands"
    return RedirectResponse(url=invite_url)

@app.get("/support")
async def support_server():
    """Redirect to support Discord server"""
    support_url = config.get('supportServer', 'https://discord.gg/your-support-server')
    return RedirectResponse(url=support_url)

@app.get("/admin", response_class=HTMLResponse)
async def admin_login(request: Request):
    """Admin login page"""
    return templates.TemplateResponse("admin_login.html", {"request": request})

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify admin credentials"""
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, config.get('dashboardToken', 'guardian123'))
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard(request: Request, admin: str = Depends(verify_admin)):
    """Protected admin dashboard"""
    return templates.TemplateResponse("admin_dashboard.html", {
        "request": request,
        "admin": admin,
        "bot_data": bot_data
    })

@app.get("/api/admin/update-stats")
async def update_stats(
    total_tickets: Optional[int] = Query(None),
    active_tickets: Optional[int] = Query(None),
    admin: str = Depends(verify_admin)
):
    """Update bot statistics (admin only)"""
    if total_tickets is not None:
        bot_data["total_tickets"] = total_tickets
    if active_tickets is not None:
        bot_data["active_tickets"] = active_tickets
        bot_data["resolved_tickets"] = bot_data["total_tickets"] - active_tickets
    
    return {"message": "Stats updated successfully", "data": bot_data}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "timestamp": datetime.datetime.now().isoformat()}

if __name__ == "__main__":
    print("🌐 Starting Guardian Bot Public Dashboard...")
    print("📊 Public URL: http://localhost:8000")
    print("🔗 Admin Panel: http://localhost:8000/admin")
    print("🎫 Invite Bot: http://localhost:8000/invite")
    print("💬 Support: http://localhost:8000/support")
    print("🔑 Admin Login: admin / guardian123")
    print("📡 Ready for public deployment!")
    
    # For production deployment, use:
    # uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
    uvicorn.run(app, host="0.0.0.0", port=8000)