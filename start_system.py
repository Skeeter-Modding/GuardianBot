import asyncio
import subprocess
import sys
import time
import threading

def run_discord_bot():
    """Run the Discord bot"""
    print("🤖 Starting Discord Bot...")
    try:
        subprocess.run([sys.executable, "discord_bot.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Discord bot failed: {e}")
    except KeyboardInterrupt:
        print("🛑 Discord bot stopped by user")

def run_dashboard():
    """Run the FastAPI dashboard"""
    print("🌐 Starting Web Dashboard...")
    try:
        subprocess.run([sys.executable, "dashboard_app.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Dashboard failed: {e}")
    except KeyboardInterrupt:
        print("🛑 Dashboard stopped by user")

def main():
    print("🚀 GUARDIAN BOT SYSTEM STARTING...")
    print("=" * 50)
    print("🛡️  Discord Security Bot")
    print("🎫  Ticket System")
    print("🤖  Trump AI Integration")
    print("🌐  Web Dashboard")
    print("=" * 50)
    
    # Start both services in separate threads
    bot_thread = threading.Thread(target=run_discord_bot, daemon=True)
    dashboard_thread = threading.Thread(target=run_dashboard, daemon=True)
    
    try:
        # Start Discord bot
        bot_thread.start()
        time.sleep(2)  # Give bot time to start
        
        # Start dashboard
        dashboard_thread.start()
        time.sleep(2)  # Give dashboard time to start
        
        print("\n✅ SYSTEM READY!")
        print("🤖 Discord Bot: Starting...")
        print("🌐 Dashboard: http://localhost:8000")
        print("🔑 Username: admin")
        print("🔑 Password: admin123")
        print("\nPress Ctrl+C to stop all services")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Guardian Bot System...")
        print("✅ All services stopped")

if __name__ == "__main__":
    main()