# 🎯 Backend CI/CD - Quick Setup Guide

## ✅ Files Updated

1. ✅ `.env.production` - Fixed FRONTEND_URL
2. ✅ `.github/workflows/deploy.yml` - Complete CI/CD pipeline
3. ✅ `docker-compose.prod.yml` - Production Docker configuration
4. ✅ `GITHUB_SECRETS.md` - Complete secrets documentation

---

## 🔐 GitHub Secrets to Configure (12 Required + 4 Optional)

### ✅ Required Secrets (12)

| # | Secret Name | Example Value | Generate With |
|---|-------------|---------------|---------------|
| 1 | `DB_HOST` | `postgres` | Check existing container |
| 2 | `DB_PORT` | `5432` | Default PostgreSQL |
| 3 | `DB_USERNAME` | `postgres` | Your DB user |
| 4 | `DB_PASSWORD` | `[strong password]` | `openssl rand -base64 32` |
| 5 | `DB_DATABASE` | `garage_platform` | Your DB name |
| 6 | `JWT_SECRET` | `[64 char hex]` | See below |
| 7 | `JWT_REFRESH_SECRET` | `[64 char hex]` | See below |
| 8 | `FRONTEND_URL` | `https://autofix.prochainconsulting.com` | Your frontend URL |
| 9 | `VPS_HOST` | `vps-17f83296` | Your VPS hostname |
| 10 | `VPS_USERNAME` | `ubuntu` | Your SSH user |
| 11 | `VPS_SSH_KEY` | `[private key]` | SSH key generation |
| 12 | `VPS_PORT` | `22` | SSH port |

### Optional Secrets (Email - 4)
- `SMTP_HOST` - Email server
- `SMTP_PORT` - Email port
- `SMTP_USER` - Email address
- `SMTP_PASS` - Email password

---

## 🔑 Generate Secrets Quickly

### Database Password
```bash
openssl rand -base64 32
```

### JWT Secrets (Run TWICE - different values!)
```bash
# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# For JWT_REFRESH_SECRET (must be different!)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### SSH Key
```bash
# Generate
ssh-keygen -t ed25519 -C "github-backend" -f ~/.ssh/github_backend

# Copy to VPS
ssh-copy-id -i ~/.ssh/github_backend.pub ubuntu@vps-17f83296

# Get private key (copy ALL output)
cat ~/.ssh/github_backend
```

---

## 📝 Current Database Container

Based on your running containers:
```bash
Container: ride_postgres_dev
Port: 5432:5432
Status: Running
```

**Use for DB_HOST:** `ride_postgres_dev` (to connect to existing database)

**OR** Create new dedicated database container with `docker-compose.prod.yml`

---

## 🌐 Backend Configuration

| Setting | Value |
|---------|-------|
| **Container Name** | `autofix_backend_prod` |
| **Port** | 4000:4000 |
| **Deploy Path** | `/var/www/autofix-backend` |
| **API URL** | `https://backend.prochainconsulting.com/api/v1` |
| **Health Check** | `https://backend.prochainconsulting.com/api/v1/health` |

---

## 🚀 Deployment Flow

```
1. Configure GitHub Secrets (12 required)
         ↓
2. Push to production branch
         ↓
3. GitHub Actions runs:
   - Install dependencies
   - Run tests
   - Build Docker image
   - Create .env.production
   - Transfer to VPS
   - Deploy container
         ↓
4. ✅ Backend live at https://backend.prochainconsulting.com/api/v1
```

---

## 📋 Setup Checklist

### Before Deployment
- [ ] All 12 required secrets added to GitHub
- [ ] JWT secrets are 64+ characters
- [ ] JWT_SECRET ≠ JWT_REFRESH_SECRET (different!)
- [ ] SSH key can connect to VPS
- [ ] Database is accessible (check container)
- [ ] Nginx configured for backend.prochainconsulting.com
- [ ] SSL certificate obtained

### After First Deployment
- [ ] Container running: `docker ps | grep autofix_backend`
- [ ] Health check passes: `curl https://backend.prochainconsulting.com/api/v1/health`
- [ ] Logs show no errors: `docker logs autofix_backend_prod`
- [ ] Frontend can connect to backend

---

## 🔧 Quick Commands

### Generate All Secrets at Once
```bash
echo "=== Database Password ==="
openssl rand -base64 32
echo ""
echo "=== JWT_SECRET ==="
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""
echo "=== JWT_REFRESH_SECRET ==="
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Check Backend Status
```bash
# Check container
ssh ubuntu@vps-17f83296 "docker ps | grep autofix_backend"

# View logs
ssh ubuntu@vps-17f83296 "docker logs -f --tail 100 autofix_backend_prod"

# Test health endpoint
curl https://backend.prochainconsulting.com/api/v1/health
```

### Manual Deployment
```bash
cd D:\garage-platform\backend
git add .
git commit -m "Setup backend CI/CD"
git checkout -b production
git push origin production
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs autofix_backend_prod

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### Database connection error
```bash
# Check if database container is running
docker ps | grep postgres

# Use correct DB_HOST:
# - If using existing: ride_postgres_dev
# - If new database: postgres
```

### JWT errors
```bash
# Ensure secrets are long enough
# JWT_SECRET must be 64+ characters
# JWT_REFRESH_SECRET must be different
```

---

## 📚 Documentation Files

- **GITHUB_SECRETS.md** - Detailed secrets documentation
- **.env.production** - Production environment template
- **docker-compose.prod.yml** - Production Docker config
- **.github/workflows/deploy.yml** - CI/CD pipeline

---

## ✨ What's Different from Old Setup?

1. ✅ Uses `/var/www/autofix-backend` (standard path)
2. ✅ Dedicated container for backend only
3. ✅ Proper CI/CD with GitHub Actions
4. ✅ Health checks and monitoring
5. ✅ Secure secrets management
6. ✅ API v1 versioning support

---

## 🎊 Ready to Deploy!

**Next steps:**
1. Add all 12 secrets to GitHub
2. Push to production branch
3. Monitor deployment in Actions tab
4. Verify at https://backend.prochainconsulting.com/api/v1/health

**Frontend connects to backend using:**
```
https://backend.prochainconsulting.com/api/v1
```

🚀 **Deploy now!**
