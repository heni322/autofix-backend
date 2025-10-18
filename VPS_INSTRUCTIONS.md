# 🚀 VPS Deployment Instructions

## Current Situation
You're on the VPS with the container already running, but migrations aren't set up yet.

## ⚡ Quick Fix (Do This Now on VPS)

### Step 1: Commit and push from your local machine first
```bash
# On Windows (D:\garage-platform\backend)
git add .
git commit -m "Add migration system"
git push origin main
```

### Step 2: On VPS - Pull and rebuild

```bash
# SSH to VPS (if not already)
ssh ubuntu@vps-17f83296

# Find your project directory
cd ~
find . -name "docker-compose.prod.yml" -path "*autofix*" 2>/dev/null

# OR if you know where it is:
cd ~/autofix  # or wherever your project is

# Pull latest code
git pull origin main

# Go to backend directory
cd backend  # or wherever the Dockerfile is

# Rebuild the image
sudo docker build -t autofix-backend:latest .

# Stop the old container
sudo docker stop autofix_backend_prod
sudo docker rm autofix_backend_prod

# Start new container
sudo docker-compose -f docker-compose.prod.yml up -d autofix-backend

# Watch logs to see migration running
sudo docker logs -f autofix_backend_prod
```

You should see:
```
🚀 Starting AutoFix Backend...
⏳ Waiting for database...
✅ Database is up!
🗄️  Running database migrations...
Data Source initialized
✅ Migrations completed successfully
🎯 Starting application...
```

### Step 3: Run seeders (optional)
```bash
sudo docker exec -it autofix_backend_prod node dist/database/seed.js
```

## 📋 What If You Don't Have the Code on VPS?

If you need to clone the repository:

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/garage-platform.git
cd garage-platform/backend

# Copy your .env file or create it
nano .env
# Add your database credentials, JWT secrets, etc.

# Build and start
sudo docker build -t autofix-backend:latest .
sudo docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Verify Everything Works

```bash
# 1. Check container is running
sudo docker ps | grep autofix_backend

# 2. Check logs show successful migration
sudo docker logs autofix_backend_prod | grep "Migrations completed"

# 3. Check tables exist in database
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "\dt"

# Should show:
#  categories
#  garage_services  
#  garages
#  migrations
#  notifications
#  reservations
#  reviews
#  services
#  users

# 4. Test API
curl http://localhost:4000/api/v1/health

# 5. Check via browser
# https://backend.prochainconsulting.com/api/v1/health
# https://backend.prochainconsulting.com/api/docs
```

## 🐛 If Something Goes Wrong

### Container won't start
```bash
# Check logs
sudo docker logs autofix_backend_prod

# Common issues:
# - Database not ready: wait 30 seconds
# - Wrong .env values: check DB_NAME, DB_HOST, etc.
# - Migration error: check the error message
```

### "Cannot find module" error
```bash
# Make sure you built the image AFTER pulling code
sudo docker build -t autofix-backend:latest . --no-cache

# Then restart
sudo docker-compose -f docker-compose.prod.yml up -d autofix-backend
```

### Tables already exist error
```bash
# Option 1: Clear migration tracking (safe)
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "DROP TABLE IF EXISTS migrations;"
sudo docker restart autofix_backend_prod

# Option 2: Drop all and recreate (DANGER: loses data!)
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
sudo docker restart autofix_backend_prod
```

## 📁 Project Structure on VPS

Your project should look like this:
```
~/garage-platform/  (or ~/autofix/)
├── backend/
│   ├── src/
│   │   └── database/
│   │       ├── data-source.ts
│   │       ├── migrations/
│   │       │   └── 1729261200000-InitialSchema.ts
│   │       └── seeders/
│   ├── Dockerfile
│   ├── docker-compose.prod.yml
│   ├── docker-entrypoint.sh
│   ├── package.json
│   └── .env
└── frontend/
```

## 🎯 Environment Variables (.env)

Make sure your `.env` has:
```env
# Database
DB_HOST=autofix-postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=garage_platform

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Application
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://autofix.prochainconsulting.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 📞 Still Stuck?

Run this diagnostic:
```bash
# Full system check
echo "=== Docker Status ===" && \
sudo docker ps | grep autofix && \
echo -e "\n=== Backend Logs (last 50 lines) ===" && \
sudo docker logs --tail 50 autofix_backend_prod && \
echo -e "\n=== Database Tables ===" && \
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "\dt" && \
echo -e "\n=== Migration Status ===" && \
sudo docker exec -it autofix_backend_prod node -e "const {AppDataSource} = require('./dist/database/data-source'); AppDataSource.initialize().then(async () => { const migrations = await AppDataSource.showMigrations(); console.log('Pending:', migrations); await AppDataSource.destroy(); });"
```

Copy the output and share it if you need help.
