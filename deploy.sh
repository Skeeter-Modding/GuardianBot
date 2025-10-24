#!/bin/bash
# Guardian Bot Public Dashboard Deployment Script
# For use with services like Railway, Heroku, DigitalOcean, etc.

echo "🚀 Guardian Bot Public Dashboard Deployment"
echo "=========================================="

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install fastapi uvicorn jinja2 python-multipart

# Create Procfile for Heroku
echo "📝 Creating Procfile..."
cat > Procfile << EOF
web: python public_dashboard.py
EOF

# Create requirements.txt
echo "📋 Creating requirements.txt..."
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn==0.24.0
jinja2==3.1.2
python-multipart==0.0.6
EOF

# Create runtime.txt for Heroku
echo "🐍 Creating runtime.txt..."
cat > runtime.txt << EOF
python-3.11.6
EOF

# Create Railway configuration
echo "🚂 Creating railway.json..."
cat > railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "python public_dashboard.py",
    "healthcheckPath": "/health"
  }
}
EOF

# Create Dockerfile
echo "🐳 Creating Dockerfile..."
cat > Dockerfile << EOF
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p templates static

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["python", "public_dashboard.py"]
EOF

# Create docker-compose for local development
echo "🔧 Creating docker-compose.yml..."
cat > docker-compose.yml << EOF
version: '3.8'
services:
  guardian-dashboard:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
    volumes:
      - ./config.json:/app/config.json
    restart: unless-stopped
EOF

# Create .gitignore
echo "📁 Creating .gitignore..."
cat > .gitignore << EOF
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.cache
nosetests.xml
coverage.xml
*.log
.env
.vscode/
*.sqlite
*.db
EOF

# Create environment variables template
echo "🔐 Creating .env.example..."
cat > .env.example << EOF
# Guardian Bot Dashboard Configuration
PORT=8000
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_BOT_TOKEN=your_bot_token_here
DASHBOARD_PASSWORD=guardian123
SUPPORT_SERVER=https://discord.gg/your-support-server
EOF

echo ""
echo "✅ Deployment files created successfully!"
echo ""
echo "🌐 DEPLOYMENT OPTIONS:"
echo ""
echo "1. RAILWAY (Recommended):"
echo "   - Connect your GitHub repo to Railway"
echo "   - Railway will auto-deploy using railway.json"
echo "   - Custom domain: guardianbot.up.railway.app"
echo ""
echo "2. HEROKU:"
echo "   - heroku create guardianbot-dashboard"
echo "   - git push heroku main"
echo "   - Custom domain: guardianbot-dashboard.herokuapp.com"
echo ""
echo "3. DIGITALOCEAN APP PLATFORM:"
echo "   - Connect GitHub repo"
echo "   - Auto-detects Python and uses Dockerfile"
echo "   - Custom domain: guardianbot-dashboard.ondigitalocean.app"
echo ""
echo "4. RENDER:"
echo "   - Connect GitHub repo"
echo "   - Build command: pip install -r requirements.txt"
echo "   - Start command: python public_dashboard.py"
echo ""
echo "5. CUSTOM DOMAIN SETUP:"
echo "   - Point guardianbot.discord.gg to your deployment"
echo "   - Update DNS A/CNAME records"
echo "   - Enable HTTPS through platform"
echo ""
echo "🔧 ENVIRONMENT VARIABLES TO SET:"
echo "   PORT=8000"
echo "   DISCORD_CLIENT_ID=your_client_id"
echo "   DASHBOARD_PASSWORD=guardian123"
echo ""
echo "📡 Your dashboard will be accessible at:"
echo "   https://your-domain.com"
echo "   https://your-domain.com/admin (admin panel)"
echo "   https://your-domain.com/invite (bot invite)"
echo "   https://your-domain.com/api/stats (public API)"
echo ""