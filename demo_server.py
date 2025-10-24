import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def start_demo_server():
    """Start a simple web server to demonstrate the ticket system"""
    
    # Change to the directory containing the HTML file
    os.chdir(Path(__file__).parent)
    
    PORT = 8080
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("🚀 GUARDIAN BOT TICKET SYSTEM DEMO")
            print("=" * 45)
            print(f"🌐 Server running at: http://localhost:{PORT}")
            print(f"🎫 Demo page: http://localhost:{PORT}/ticket_system_demo.html")
            print("🎭 Trump AI: Ready")
            print("📊 Analytics: Live Demo Data")
            print("=" * 45)
            print("🔥 Features shown:")
            print("   ✅ Ticket Creation Interface")
            print("   ✅ Staff Performance Leaderboard")
            print("   ✅ Active Ticket Management")
            print("   ✅ Real-time Statistics")
            print("   ✅ Priority System")
            print("   ✅ Command Examples")
            print("=" * 45)
            print("📱 Opening browser automatically...")
            print("🛑 Press Ctrl+C to stop the demo server")
            print()
            
            # Open browser automatically
            webbrowser.open(f'http://localhost:{PORT}/ticket_system_demo.html')
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Demo server stopped")
        print("✅ Thank you for viewing the Guardian Bot Ticket System!")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {PORT} is already in use")
            print("💡 Try stopping other web servers or use a different port")
        else:
            print(f"❌ Server error: {e}")

if __name__ == "__main__":
    start_demo_server()