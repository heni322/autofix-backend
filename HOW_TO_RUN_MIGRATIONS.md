# 🗄️ How to Run Migrations in Docker

## 🎯 Quick Answer

Migrations run **AUTOMATICALLY** when the container starts! But you can also run them manually.

## 🔄 Automatic Migration (Default)

When you start/restart the container, migrations run automatically:

```bash
# On VPS
sudo docker-compose -f docker-compose.prod.yml up -d autofix-backend

# Migrations run automatically during startup!
# Check logs to confirm:
sudo docker logs autofix_backend_prod
```

You should see:
```
🚀 Starting AutoFix Backend...
⏳ Waiting for database...
✅ Database is up!
🗄️  Running database migrations...
✅ Migrations completed successfully
🎯 Starting application...
```

## 🔧 Manual Migration Commands

### Run Migrations
```bash
# From host (outside container)
sudo docker exec -it autofix_backend_prod npm run migration:run

# From inside container
sudo docker exec -it autofix_backend_prod sh
npm run migration:run
exit
```

### Check Migration Status
```bash
sudo docker exec -it autofix_backend_prod npm run migration:show
```

Output shows:
```
[X] InitialSchema1729261200000  ← Already ran
[ ] AddNewFeature1729270000000  ← Pending
```

### Revert Last Migration
```bash
sudo docker exec -it autofix_backend_prod npm run migration:revert
```

### Run Seeders After Migration
```bash
sudo docker exec -it autofix_backend_prod npm run seed
```

## 📋 Complete Deployment Flow

### Step 1: On Your Local Machine (Windows)
```bash
cd D:\garage-platform\backend

# If you made entity changes, generate migration:
npm run migration:generate -- src/database/migrations/YourMigrationName

# Test locally
npm run build
npm run migration:run

# Commit and push
git add .
git commit -m "Add new migration"
git push origin main
```

### Step 2: On VPS
```bash
# SSH to VPS
ssh ubuntu@your-vps-ip

# Navigate to project
cd ~/garage-platform/backend

# Pull latest code
git pull origin main

# Rebuild Docker image (includes new migration files)
sudo docker build -t autofix-backend:latest .

# Stop old container
sudo docker stop autofix_backend_prod

# Start new container (migrations run automatically!)
sudo docker-compose -f docker-compose.prod.yml up -d autofix-backend

# Watch the logs to see migration running
sudo docker logs -f autofix_backend_prod
```

## 🎬 Real-World Example

Let's say you added a new field to the User entity:

### Local Machine:
```bash
# 1. Edit src/entities/user.entity.ts
# Add: @Column() middleName: string;

# 2. Generate migration
npm run migration:generate -- src/database/migrations/AddMiddleNameToUser

# 3. Review generated file in src/database/migrations/

# 4. Test it
npm run build
npm run migration:run

# 5. Verify in your local database
# 6. Commit and push
git add .
git commit -m "Add middle name field to users"
git push
```

### VPS:
```bash
# 1. SSH and pull
ssh ubuntu@vps
cd ~/garage-platform/backend
git pull

# 2. Rebuild and restart (one command)
sudo docker build -t autofix-backend:latest . && \
sudo docker-compose -f docker-compose.prod.yml up -d autofix-backend

# 3. Check logs
sudo docker logs autofix_backend_prod

# You'll see:
# 🗄️ Running database migrations...
# Migration AddMiddleNameToUser1729270000000 has been executed successfully.
# ✅ Migrations completed successfully
```

## 🐛 Troubleshooting

### Problem: Migration doesn't run

**Check 1: Is the migration file in the container?**
```bash
sudo docker exec -it autofix_backend_prod ls -la dist/database/migrations/
```

**Solution:** Rebuild the image
```bash
sudo docker build -t autofix-backend:latest .
sudo docker-compose -f docker-compose.prod.yml up -d autofix-backend
```

### Problem: "Migration already executed" but tables don't exist

**Check database:**
```bash
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "\dt"
```

**Solution:** Clear migration tracking and re-run
```bash
# Access database
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform

# Clear migrations table
DELETE FROM migrations;
\q

# Restart backend (migrations will run again)
sudo docker restart autofix_backend_prod
```

### Problem: Container won't start after adding migration

**Check logs:**
```bash
sudo docker logs autofix_backend_prod
```

**Common causes:**
- Syntax error in migration file
- Database connection issue
- Migration conflicts with existing data

**Solution:**
```bash
# Fix the migration file locally
# Rebuild and redeploy

# OR temporarily skip migrations:
sudo docker exec -it autofix_backend_prod sh
# Edit entrypoint or run app directly
node dist/main.js
```

## 📊 Verify Migrations Worked

### Check Migration Table
```bash
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "SELECT * FROM migrations;"
```

### Check Tables Created
```bash
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "\dt"
```

Should show:
```
 Schema |       Name       | Type  |  Owner   
--------+------------------+-------+----------
 public | categories       | table | postgres
 public | garage_services  | table | postgres
 public | garages          | table | postgres
 public | migrations       | table | postgres
 public | notifications    | table | postgres
 public | reservations     | table | postgres
 public | reviews          | table | postgres
 public | services         | table | postgres
 public | users            | table | postgres
```

### Check Specific Table Structure
```bash
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "\d users"
```

## 🔁 Common Workflows

### 1. Fresh Database Setup
```bash
# Start containers (migrations run automatically)
sudo docker-compose -f docker-compose.prod.yml up -d

# Seed database
sudo docker exec -it autofix_backend_prod npm run seed
```

### 2. Update Existing Deployment
```bash
# Pull code
git pull

# Rebuild
sudo docker build -t autofix-backend:latest .

# Restart (migrations run automatically)
sudo docker-compose -f docker-compose.prod.yml up -d autofix-backend
```

### 3. Rollback Migration
```bash
# Revert last migration
sudo docker exec -it autofix_backend_prod npm run migration:revert

# Check status
sudo docker exec -it autofix_backend_prod npm run migration:show

# Restart app
sudo docker restart autofix_backend_prod
```

### 4. Force Re-run All Migrations
```bash
# Clear migrations table
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "TRUNCATE migrations;"

# Restart backend
sudo docker restart autofix_backend_prod

# Migrations will run again
sudo docker logs -f autofix_backend_prod
```

## 🎯 Best Practices

1. **Always test migrations locally first**
   ```bash
   npm run build
   npm run migration:run
   ```

2. **Check migration status before and after**
   ```bash
   npm run migration:show
   ```

3. **Keep backups**
   ```bash
   sudo docker exec autofix_postgres_prod pg_dump -U postgres garage_platform > backup.sql
   ```

4. **Review migration SQL**
   - Open the generated migration file
   - Understand what it will do
   - Test in development first

5. **Monitor logs during deployment**
   ```bash
   sudo docker logs -f autofix_backend_prod
   ```

## 💡 Pro Tips

### Dry Run (Check what will happen)
Migration files show the SQL in the `up()` method. Review before deploying!

### Quick Health Check
```bash
# Container running?
sudo docker ps | grep autofix_backend

# Migrations successful?
sudo docker logs autofix_backend_prod | grep "Migrations completed"

# API responding?
curl http://localhost:4000/api/v1/health
```

### Access Database Directly
```bash
# Interactive psql
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform

# Quick query
sudo docker exec -it autofix_postgres_prod psql -U postgres -d garage_platform -c "SELECT COUNT(*) FROM users;"
```

## 📞 Need Help?

**Logs not showing migrations?**
- Ensure `docker-entrypoint.sh` has execute permissions
- Check Dockerfile includes: `COPY docker-entrypoint.sh`
- Rebuild the image

**Migrations fail silently?**
- Check `docker-entrypoint.sh` script
- Ensure TypeORM CLI is installed
- Check DB connection env variables

**Want to disable auto-migrations?**
Edit `docker-entrypoint.sh` and comment out the migration line.

---

**Remember:** Migrations run automatically on container start. You rarely need to run them manually! 🎉
