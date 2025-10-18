# ✅ Simple Deployment Checklist

## Step 1: Push Code (Windows - Your Machine)
```bash
cd D:\garage-platform\backend
git add .
git commit -m "Add migration system"
git push origin main
```

## Step 2: Deploy (VPS - Ubuntu Server)
```bash
# SSH to server
ssh ubuntu@vps-17f83296

# Go to project (adjust path if needed)
cd ~/garage-platform/backend

# Pull latest code
git pull origin main

# Rebuild image
sudo docker build -t autofix-backend:latest .

# Restart container
sudo docker stop autofix_backend_prod
sudo docker rm autofix_backend_prod
sudo docker-compose -f docker-compose.prod.yml up -d autofix-backend

# Check logs (should see "Migrations completed successfully")
sudo docker logs -f autofix_backend_prod
```

## Step 3: Seed Data (Optional - First Time Only)
```bash
sudo docker exec -it autofix_backend_prod node dist/database/seed.js
```

## Step 4: Verify
```bash
# Check container is running
sudo docker ps | grep autofix_backend

# Check tables exist
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "\dt"

# Test API
curl http://localhost:4000/api/v1/health
```

## ✅ Done!

Your backend now has:
- ✅ Automatic database migrations
- ✅ All tables created properly
- ✅ Seeds ready to run
- ✅ Production-ready setup

---

**Need help?** Read `VPS_INSTRUCTIONS.md` or `HOW_TO_RUN_MIGRATIONS.md`
