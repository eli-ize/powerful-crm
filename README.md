
  # Powerful CRM

AI-powered CRM with Telnyx calling integration.

## Live URL
https://powerful-crm.gentlepond-89090d4a.eastus.azurecontainerapps.io

## Quick Start

### Local Development
```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

### Deploy
Push to `deploy-clean` branch - deploys automatically via GitHub Actions.

## Configuration

### Required GitHub Secrets
- `AZURE_CREDENTIALS` - Azure service principal
- `JWT_SECRET` - Min 32 chars
- `JWT_REFRESH_SECRET` - Min 32 chars  
- `BACKEND_URL` - Production URL
- `TELNYX_API_KEY` - From Telnyx portal
- `TELNYX_CONNECTION_ID` - Outbound voice profile ID
- `DATABASE_URL` - SQLite: `file:./production.db`

### Telnyx Setup
1. Get Outbound Voice Profile at https://portal.telnyx.com/#/app/outbound_voice_profiles
2. Set webhook: `https://powerful-crm.gentlepond-89090d4a.eastus.azurecontainerapps.io/api/calls/webhook`
3. Add profile ID to `TELNYX_CONNECTION_ID` secret

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + Prisma
- Database: SQLite (production), PostgreSQL (optional)
- Deployment: Azure Container Apps
- Registry: GitHub Container Registry

---

## 📖 Documentation (OLD - IGNORE)


- 🏗️ **[ARCHITECTURE.md](./src/ARCHITECTURE.md)** - Complete system design
- 🚀 **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** - 15-minute Azure setup  
- 💰 **[BUSINESS_MODELS.md](./src/BUSINESS_MODELS.md)** - How to make money
- 🎯 **[USE_CASES.md](./src/USE_CASES.md)** - Industry examples
- ⚙️ **[COPILOT_INSTRUCTIONS.md](./src/COPILOT_INSTRUCTIONS.md)** - Development guide

## 🌟 What Makes This Special

✅ **Universal AI Sales Platform** - Works for ANY industry
✅ **Azure Free Tier Optimized** - Deploy for $0/month
✅ **Real AI Calling** - Azure Speech + OpenAI integration
✅ **Complete CRM Suite** - Contacts, deals, campaigns, analytics
✅ **Virtual AI Agents** - 24/7 automated calling
✅ **Production Ready** - Docker, CI/CD, monitoring included

## 💡 Perfect For

- 🌐 **Web design agencies** - Find businesses without websites
- 💼 **SaaS companies** - Qualify leads automatically  
- 📞 **Call centers** - Replace human agents with AI
- 🏢 **Consultants** - Scale outreach efforts
- 📈 **Marketing agencies** - Automate lead generation

---

**Ready to 10x your sales?** Start with the [Quick Start Guide](./DEPLOYMENT_QUICKSTART.md)! 🎯
  
