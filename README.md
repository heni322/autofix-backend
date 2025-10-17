# 🚗 AutoFix - Garage Platform

Plateforme de réservation en ligne pour garages automobiles en Tunisie.

## 🌐 Production

- **Frontend:** https://autofix.tn
- **Backend API:** https://backend.autofix.tn/api
- **Documentation:** https://backend.autofix.tn/api/docs

## 🏗️ Architecture

```
autofix.tn (Frontend - Next.js)
    ↓ API Calls
backend.autofix.tn (Backend - NestJS)
    ↓ Database
PostgreSQL (Docker)
```

## 🚀 Déploiement

### Prérequis
- VPS Ubuntu avec Docker
- Domaines configurés (DNS)
- Compte GitHub

### Guide Rapide

1. **Configuration DNS** → Voir `SETUP_DNS_SSL.md`
2. **Secrets GitHub** → Voir `GITHUB_SECRETS_AUTOFIX.md`
3. **Déploiement** → Voir `QUICK_DEPLOY_GUIDE.md`

### Script Automatique

```bash
ssh ubuntu@VOTRE_VPS
./deploy-vps.sh
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `QUICK_DEPLOY_GUIDE.md` | Guide de déploiement complet |
| `GITHUB_SECRETS_AUTOFIX.md` | Configuration des secrets |
| `SETUP_DNS_SSL.md` | Configuration DNS et SSL |
| `COMMANDS_CHEATSHEET.md` | Commandes essentielles |
| `DEPLOY_SUMMARY.md` | Résumé rapide |

## 🛠️ Développement Local

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## 📦 Stack Technique

- **Frontend:** Next.js 14, React, TailwindCSS, TypeScript
- **Backend:** NestJS, TypeORM, PostgreSQL
- **Déploiement:** Docker, Docker Compose, Nginx, Let's Encrypt
- **CI/CD:** GitHub Actions

## 🔐 Sécurité

- ✅ HTTPS/SSL (Let's Encrypt)
- ✅ CORS configuré
- ✅ JWT Authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection protection

## 📊 Fonctionnalités

- 🔍 Recherche de garages par ville/catégorie/service
- 📅 Réservation en ligne
- ⭐ Système d'évaluation
- 👤 Gestion des utilisateurs
- 🚗 Multi-services (révision, réparation, diagnostic)
- 📱 Responsive design

## 🤝 Contributing

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 👥 Équipe

Développé avec ❤️ pour la communauté automobile tunisienne.

---

**Support:** Consultez la documentation dans le dossier `/backend`
