# 🔐 Backend GitHub Secrets Configuration

## Required Secrets for Backend CI/CD Pipeline

Configure these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

---

## 🗄️ Database Secrets

### 1. DB_HOST
**Value:** `postgres` or `ride_postgres_dev` (your existing PostgreSQL container name)

**Description:** Database host - use the container name for Docker networking

**Notes:** 
- If using existing container: `ride_postgres_dev`
- If creating new container: `postgres`
- Check with: `docker ps | grep postgres`

---

### 2. DB_PORT
**Value:** `5432`

**Description:** PostgreSQL port (default)

---

### 3. DB_USERNAME
**Value:** `postgres`

**Description:** Database username

**Security:** Consider using a dedicated user in production

---

### 4. DB_PASSWORD
**Value:** `YOUR_SECURE_PASSWORD`

**Description:** Database password

**How to generate strong password:**
```bash
# Generate random 32-character password
openssl rand -base64 32
```

**⚠️ IMPORTANT:** Replace with a strong password, never use default!

---

### 5. DB_DATABASE
**Value:** `garage_platform`

**Description:** Database name for AutoFix application

---

## 🔑 JWT Secrets

### 6. JWT_SECRET
**Value:** `[Your 64+ character secret]`

**Description:** Secret key for signing JWT access tokens

**How to generate:**
```bash
# Generate secure 64-character JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4
```

**⚠️ CRITICAL:** Must be at least 32 characters, recommended 64+

---

### 7. JWT_REFRESH_SECRET
**Value:** `[Different 64+ character secret]`

**Description:** Secret key for signing JWT refresh tokens

**How to generate:**
```bash
# Generate different secret for refresh tokens
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**⚠️ CRITICAL:** Must be DIFFERENT from JWT_SECRET!

---

## 🌐 URL Configuration

### 8. FRONTEND_URL
**Value:** `https://autofix.prochainconsulting.com`

**Description:** Frontend application URL for CORS configuration

---

## 🖥️ VPS Configuration

### 9. VPS_HOST
**Value:** `vps-17f83296` (or your VPS IP)

**Description:** VPS hostname or IP address

---

### 10. VPS_USERNAME
**Value:** `ubuntu`

**Description:** SSH username for VPS connection

---

### 11. VPS_SSH_KEY
**Value:** `[Your SSH private key]`

**Description:** Private SSH key for authentication

**How to generate:**
```bash
# Generate new SSH key for backend deployment
ssh-keygen -t ed25519 -C "github-actions-backend" -f ~/.ssh/github_actions_backend

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/github_actions_backend.pub ubuntu@vps-17f83296

# Display private key (copy entire output to GitHub Secret)
cat ~/.ssh/github_actions_backend
```

**Format:** Should include BEGIN and END lines
```
-----BEGIN OPENSSH PRIVATE KEY-----
[key content]
-----END OPENSSH PRIVATE KEY-----
```

---

### 12. VPS_PORT
**Value:** `22`

**Description:** SSH port (default)

---

## 📧 Email Configuration (Optional)

### 13. SMTP_HOST
**Value:** `smtp.gmail.com`

**Description:** SMTP server hostname

**Optional:** Only needed if sending emails

---

### 14. SMTP_PORT
**Value:** `587`

**Description:** SMTP port (587 for TLS, 465 for SSL)

---

### 15. SMTP_USER
**Value:** `your-email@gmail.com`

**Description:** Email address for sending

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in SMTP_PASS

---

### 16. SMTP_PASS
**Value:** `[Your app-specific password]`

**Description:** SMTP password or app-specific password

**For Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search "App passwords"
4. Create new app password
5. Use this password (not your Gmail password)

---

## 📋 Complete Secrets Checklist

### Required (Must Have)
- [ ] `DB_HOST` - Database host
- [ ] `DB_PORT` - Database port  
- [ ] `DB_USERNAME` - Database username
- [ ] `DB_PASSWORD` - Database password
- [ ] `DB_DATABASE` - Database name
- [ ] `JWT_SECRET` - JWT access token secret (64+ chars)
- [ ] `JWT_REFRESH_SECRET` - JWT refresh token secret (64+ chars, different)
- [ ] `FRONTEND_URL` - Frontend URL
- [ ] `VPS_HOST` - VPS hostname/IP
- [ ] `VPS_USERNAME` - SSH username
- [ ] `VPS_SSH_KEY` - SSH private key
- [ ] `VPS_PORT` - SSH port

### Optional (For Email Features)
- [ ] `SMTP_HOST` - Email server
- [ ] `SMTP_PORT` - Email port
- [ ] `SMTP_USER` - Email address
- [ ] `SMTP_PASS` - Email password

---

## 🔒 Security Best Practices

### 1. Strong Passwords
```bash
# Generate strong passwords
openssl rand -base64 32

# Or use Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. JWT Secrets
- Use cryptographically secure random strings
- Minimum 64 characters
- Use different secrets for access and refresh tokens
- Never commit secrets to Git
- Rotate secrets periodically (every 3-6 months)

### 3. Database Security
- Use dedicated database user (not root/postgres)
- Restrict database user permissions
- Use strong passwords
- Consider using database connection pooling

### 4. SSH Keys
- Use Ed25519 keys (modern and secure)
- Use separate keys for different purposes
- Protect private keys (chmod 600)
- Add passphrase to private keys
- Regularly rotate keys

---

## 🧪 Testing Secrets Locally

Create a `.env.test` file for local testing (don't commit!):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=test_password
DB_DATABASE=garage_platform_test

# JWT (test values only!)
JWT_SECRET=test_jwt_secret_min_32_chars_long_for_testing
JWT_REFRESH_SECRET=test_refresh_secret_min_32_chars_long_for_testing

# URLs
FRONTEND_URL=http://localhost:3000

# Application
PORT=4000
NODE_ENV=development
```

---

## 📊 Quick Copy Template

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=[GENERATE_STRONG_PASSWORD]
DB_DATABASE=garage_platform

# JWT Configuration (GENERATE THESE!)
JWT_SECRET=[64_CHAR_HEX_STRING]
JWT_REFRESH_SECRET=[DIFFERENT_64_CHAR_HEX_STRING]

# URLs
FRONTEND_URL=https://autofix.prochainconsulting.com

# VPS Configuration
VPS_HOST=vps-17f83296
VPS_USERNAME=ubuntu
VPS_SSH_KEY=[ENTIRE_PRIVATE_KEY_WITH_BEGIN_END]
VPS_PORT=22

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=[APP_SPECIFIC_PASSWORD]
```

---

## 🚀 Quick Generation Script

Save this as `generate-secrets.sh`:

```bash
#!/bin/bash

echo "=== AutoFix Backend Secrets Generator ==="
echo ""

echo "DB_PASSWORD:"
openssl rand -base64 32
echo ""

echo "JWT_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""

echo "JWT_REFRESH_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""

echo "Copy these values to GitHub Secrets!"
```

Run with: `bash generate-secrets.sh`

---

## ✅ Verification

After adding secrets, verify in GitHub:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see at least 12 secrets listed
3. Values are hidden (●●●●●●●●)
4. Test deployment with a push to production branch

---

## 🆘 Common Issues

### Issue: "JWT_SECRET must be at least 32 characters"
**Solution:** Generate longer secret using crypto methods above

### Issue: "Database connection refused"
**Solution:** Check DB_HOST matches your container name

### Issue: "SSH authentication failed"
**Solution:** 
- Verify private key includes BEGIN/END lines
- Check public key is in VPS `~/.ssh/authorized_keys`
- Test SSH connection manually first

### Issue: "CORS error from frontend"
**Solution:** Verify FRONTEND_URL matches your actual frontend URL

---

## 📞 Need Help?

1. Check deployment logs in GitHub Actions
2. Verify all secrets are set
3. Ensure secrets have correct format
4. Test SSH connection manually
5. Check container logs: `docker logs autofix_backend_prod`

---

**Security Note:** Never share or commit these secrets! Keep them secure and rotate regularly.
