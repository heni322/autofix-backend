#!/bin/bash

# AutoFix Garage Platform - Quick Deploy Script
# Run this on your VPS after DNS is configured

set -e

echo "🚀 AutoFix Garage Platform - Quick Deploy"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run as root${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx docker.io docker-compose git

# Step 2: Start and enable services
echo -e "${YELLOW}🔧 Configuring services...${NC}"
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Step 3: Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
read -p "Enter your repository URL (e.g., https://github.com/user/garage-platform.git): " REPO_URL

# Clone repository
cd ~
if [ -d "garage-platform" ]; then
    echo -e "${YELLOW}Repository already exists, pulling latest changes...${NC}"
    cd garage-platform
    git pull
else
    git clone $REPO_URL garage-platform
    cd garage-platform
fi

# Copy Nginx configuration
sudo cp backend/nginx-autofix.conf /etc/nginx/sites-available/autofix
sudo ln -sf /etc/nginx/sites-available/autofix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
sudo systemctl reload nginx

# Step 4: Configure SSL
echo -e "${YELLOW}🔐 Configuring SSL...${NC}"
read -p "Enter your email for Let's Encrypt: " EMAIL

sudo certbot --nginx \
    -d autofix.tn \
    -d www.autofix.tn \
    -d backend.autofix.tn \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect

# Step 5: Create .env file
echo -e "${YELLOW}⚙️  Creating environment file...${NC}"

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""
read -sp "Enter JWT secret (min 32 chars): " JWT_SECRET
echo ""
read -sp "Enter JWT refresh secret (min 32 chars): " JWT_REFRESH_SECRET
echo ""

cat > .env << EOF
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=garage_platform

# JWT
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# URLs
FRONTEND_URL=https://autofix.tn
NEXT_PUBLIC_API_URL=https://backend.autofix.tn/api

# Application
PORT=4000
NODE_ENV=production
EOF

echo -e "${GREEN}✅ Environment file created${NC}"

# Step 6: Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

# Step 7: Deploy application
echo -e "${YELLOW}🐳 Deploying Docker containers...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for containers to be healthy
echo -e "${YELLOW}⏳ Waiting for containers to be healthy...${NC}"
sleep 30

# Step 8: Verify deployment
echo ""
echo -e "${GREEN}=========================================="
echo "✅ Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "URLs:"
echo "  - Frontend: https://autofix.tn"
echo "  - Frontend (www): https://www.autofix.tn"
echo "  - Backend API: https://backend.autofix.tn/api"
echo "  - Swagger Docs: https://backend.autofix.tn/api/docs"
echo ""
echo "Check status:"
echo "  docker-compose ps"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo -e "${YELLOW}⚠️  Important: You may need to log out and back in for Docker permissions to take effect${NC}"
echo ""
