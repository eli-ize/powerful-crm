# AI CRM - Universal Sales Automation Platform

**Sell ANYTHING with AI.** An AI-powered CRM that autonomously finds leads, qualifies them, and conducts intelligent cold calls for ANY product or service in ANY industry.

**Works for:** Web design, SaaS, consulting, call center services, digital marketing, accounting software, e-commerce, real estate, insurance, HR services, and MORE.

## 🎯 What Can You Sell?

**ANYTHING!** This platform works for:

- 🌐 **Web Design & Development** - Websites, apps, e-commerce stores
- 🤖 **AI Call Center Services** - Automation, customer service, lead qualification
- 💰 **Accounting Software** - Bookkeeping, financial tools, tax software
- 📣 **Digital Marketing** - SEO, PPC, social media, content marketing
- 💼 **Business Consulting** - Strategy, operations, scaling, advisory
- 🛍️ **E-commerce Solutions** - Shopify, online stores, marketplace integration
- 💻 **SaaS Products** - Any software subscription service
- 🏢 **Real Estate Services** - Property management, realtor tools
- 🔒 **IT & Cybersecurity** - Managed services, cloud, security
- 📚 **Educational Services** - Training, courses, certifications
- ⚖️ **Legal Tech** - Case management, document automation
- 🏥 **Healthcare Services** - Medical billing, practice management
- 📊 **And 50+ more industries...**

See [USE_CASES.md](./USE_CASES.md) for detailed examples and templates.

## 🔥 NEW: AI-Powered Autopilot

**COMPLETE END-TO-END AUTOMATION:**

1. **AI Website Analyzer** - Deep analysis of design, SEO, technical issues, content quality
   - Explains qualification criteria used
   - Scores on design, performance, SEO, content
   - Provides actionable recommendations
   
2. **Autopilot Mode** - Full automation from leads to closed deals
   - Finds leads → Analyzes websites → Makes calls → Assigns tasks → Sends emails
   - You sleep, AI works, you wake up to deals
   
3. **Task Management** - Designer assignment workflow
   - AI assigns demo creation to designers
   - Designers complete batch of demos
   - AI sends personalized emails with demos attached

**See: [AI_WEBSITE_ANALYZER_GUIDE.md](./AI_WEBSITE_ANALYZER_GUIDE.md) and [AUTOPILOT_MODE_GUIDE.md](./AUTOPILOT_MODE_GUIDE.md)**

---

## 🌟 Features

### Lead Management
- **Lead Finder** - Find businesses using Google Places API
- **Lead Qualification** - Categorize leads with custom criteria (no website, outdated design, etc.)
- **Lead Enrichment** - AI agents find missing contact information

### AI Call Center
- **Virtual Agents** - AI-powered calling agents using Azure TTS/STT
- **Campaign Management** - Create and manage prospect journeys
- **Automated Calling** - AI conducts calls, qualifies leads, and books meetings
- **Real-time Transcription** - Full call transcripts and insights
- **Smart Decision Making** - AI decides next actions based on call outcomes

### Core CRM
- Contacts, Deals, Activities management
- Email integration
- Phone & SMS (Telnyx)
- Analytics & Reporting
- Automation workflows
- Templates library
- Goals & Quotas tracking

### Multi-User System
- Role-based access control (Super Admin, Admin, Manager, Sales Rep, Viewer)
- Activity tracking for humans and AI agents
- Permission management

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete system architecture, database schema, API endpoints, and implementation details.

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- TailwindCSS
- Shadcn/ui components
- Zustand/React Context for state management

**Backend (Required for Production):**
- Next.js 14 / Node.js + Express / Python FastAPI
- PostgreSQL database
- Redis for caching
- WebSocket for real-time updates

**AI Services:**
- Azure Cognitive Services (TTS/STT)
- OpenAI GPT-4 (conversation & analysis)
- Azure OpenAI Service (optional)

**Telephony:**
- Telnyx (voice calls, SMS, recording)

**Data Enrichment:**
- Google Places API
- Hunter.io (email finding)
- Clearbit (company data)

## 🎯 Quick Start

### Want to Start NOW?

See [QUICK_START.md](./QUICK_START.md) for a 5-minute setup guide!

**Demo Accounts:**
- Email: `admin@crm.com` | Password: `demo123`
- Email: `manager@crm.com` | Password: `demo123`  
- Email: `sales@crm.com` | Password: `demo123`

### Pick Your Business Model

See [BUSINESS_MODELS.md](./BUSINESS_MODELS.md) to learn how to make money:
- 💼 Get clients for YOUR services
- 🤖 Sell AI calling services to businesses
- 📦 Build a white-label SaaS company
- 💰 Generate and sell qualified leads
- 🏢 Become an industry specialist

### Industry Templates

The platform includes **pre-built templates** for:
- Web Design, SaaS, Consulting, Marketing, Accounting, E-commerce, Real Estate, Insurance, IT Services, Legal Tech, Healthcare, Education, Manufacturing, B2B Services, and more!

Go to **"Industry Templates"** in the app to get started instantly.

## 📋 Prerequisites

Before you begin, you'll need accounts and API keys from:

1. **Google Cloud Platform** - https://console.cloud.google.com
   - Enable Places API for lead generation
   - $200 free credit/month

2. **Azure** - https://azure.microsoft.com
   - Azure OpenAI Service (Phi-4-mini-instruct model)
   - Cognitive Services (Speech)
   - ~$1-10/month depending on usage

3. **Telnyx** (Optional) - https://telnyx.com
   - For voice calls and SMS
   - ~$5/month for phone number + $0.004/min for calls

4. **Email SMTP** (Optional) - Gmail App Password
   - For sending automated emails

See **[GITHUB_SECRETS.md](../GITHUB_SECRETS.md)** for detailed setup instructions for each service.

---

## 🚀 Getting Started

### Complete Setup Guide

**See [Main README](../README.md) for full installation instructions.**

**Quick Summary:**

1. **Install Dependencies:**
```bash
# Root (Frontend)
npm install

# Backend
cd backend
npm install
```

2. **Environment Variables:**
```bash
# Backend environment
cd backend
cp .env.example .env

# Generate JWT secrets
openssl rand -base64 32  # Copy to JWT_SECRET
openssl rand -base64 32  # Copy to JWT_REFRESH_SECRET

# Add API keys (see GITHUB_SECRETS.md)
```

3. **Database Setup:**
```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed  # Creates test@powerfulcrm.com user
```

4. **Start Servers:**
```bash
# Option 1: Both servers (from root)
npm run start

# Option 2: Separate terminals
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
```

**Access Application:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Login: test@powerfulcrm.com / test123

---

## 📱 Current Status

### ✅ Fully Working Features:
- **Complete CRM System** - Contacts, deals, activities, notes
- **Lead Generation** - Google Places API integration
- **Contact Management** - Duplicate prevention, qualification
- **AI Chat** - Azure OpenAI (Phi-4) powered conversations
- **Voice Features** - Azure Speech text-to-speech, speech-to-text
- **Phone System** - Telnyx integration for calls
- **AI Autopilot** - Automated lead finding, website analysis, calling
- **Real-time UI** - Live updates, interactive dashboards
- **Multi-user System** - Role-based access control
- **Cost Tracking** - API usage monitoring
- **Database** - SQLite (dev), PostgreSQL (production) with Prisma

### ⚙️ Configuration Required:
- **API Keys** - See [GITHUB_SECRETS.md](../GITHUB_SECRETS.md) for setup instructions
- **Phone Number** - Telnyx phone number for calling (optional)
- **Email SMTP** - Gmail app password for automated emails (optional)

---

## 🔧 Production Deployment

### Deploy to Azure Container Apps

See **[DEPLOYMENT.md](../docs/DEPLOYMENT.md)** for complete deployment guide.

**Quick Overview:**

1. **Configure GitHub Secrets** - See [GITHUB_SECRETS.md](../GITHUB_SECRETS.md)
2. **Build Docker Images** - Frontend + Backend containers
3. **Deploy to Azure** - Container Apps or Web Apps
4. **Configure Environment** - Production DATABASE_URL, API keys
5. **Run Migrations** - `npx prisma migrate deploy`

**Recommended Stack:**
- **Hosting:** Azure Container Apps
- **Database:** Azure Database for PostgreSQL
- **Storage:** Azure Blob Storage (call recordings)
- **CI/CD:** GitHub Actions

---

## 📖 Usage Guide

### 1. Find Leads

1. Go to **Lead Finder**
2. Search for: "restaurants in Miami" or "software companies SF"
3. Import leads to Contacts

### 2. Qualify Leads

1. Go to **Qualification**
2. Create categories: "No Website", "Outdated Design", etc.
3. Assign leads to categories based on criteria

### 3. Create Campaign

1. Go to **Campaigns**
2. Click "New Campaign"
3. Configure:
   - Campaign name & objective
   - AI voice settings
   - Conversation script
   - Decision rules
   - Post-call actions

### 4. Configure Virtual Agent

1. Go to **Virtual Agents**
2. Create AI agent with:
   - Voice profile (Azure TTS voice)
   - Tone & personality
   - Assigned campaigns
   - Working hours

### 5. Launch Campaign

1. Add qualified leads to campaign
2. Activate virtual agents
3. Monitor real-time activity
4. Review call transcripts & insights
5. Track qualified leads

## 🎯 AI Campaign Configuration

Example campaign setup:

```typescript
{
  name: "Web Design Outreach",
  objective: "Offer website design to businesses without websites",
  
  voiceConfig: {
    voiceId: "en-US-JennyNeural",
    tone: "professional",
    speed: 1.0,
    enableMirroring: true
  },
  
  aiInstructions: {
    personality: "Professional web design consultant",
    objective: "Book a discovery call",
    script: `
      Hi, this is Sarah calling about your business's online presence.
      I noticed you don't currently have a website...
    `,
    
    qualificationCriteria: {
      interested: ["yes", "interested", "tell me more", "pricing"],
      notInterested: ["not interested", "already have", "no thanks"],
      needsFollowup: ["busy", "call back", "email me"]
    },
    
    actionRules: {
      ifInterested: "schedule_meeting",
      ifNotInterested: "mark_dead",
      ifNoAnswer: "retry",
      ifVoicemail: "leave_message"
    }
  }
}
```

## 🔐 Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Backend-only API calls** - Never call APIs from frontend
3. **Rate limiting** - Protect your APIs
4. **Audit logging** - Track all actions
5. **RBAC** - Role-based access control
6. **Encryption** - Encrypt call recordings and sensitive data

## 📊 Monitoring

Recommended tools:
- **Sentry** - Error tracking
- **Datadog** - Performance monitoring  
- **LogRocket** - Session replay
- **Custom dashboards** - Active calls, agent activity, costs

## 💰 Cost Estimate

Monthly costs for 1000 leads:

| Service | Usage | Cost |
|---------|-------|------|
| Telnyx Phone Number | 1 number | $1-5 |
| Telnyx Calls | 1000 calls @ 3 min avg | $12 |
| Telnyx SMS | 500 messages | $2 |
| Azure Speech TTS | 100,000 chars | $1 |
| Azure Speech STT | 50 hours | $50 |
| OpenAI GPT-4 | 1M tokens | $10-30 |
| Google Places API | 1000 searches | $17 |
| Hunter.io | 500 emails | $49 |
| **Total** | | **$142-164/mo** |

Plus infrastructure (hosting, database) ~$50-100/mo

## 🤝 Multi-User Roles

| Role | Permissions |
|------|------------|
| **Super Admin** | Full system access, manage all users |
| **Admin** | Manage campaigns, agents, view all data |
| **Manager** | View team performance, assign leads |
| **Sales Rep** | Manage assigned leads, view own campaigns |
| **Viewer** | Read-only access to reports |

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to backend"**
- Ensure backend is running on http://localhost:8000
- Check `BACKEND_URL` in frontend .env matches backend port

**"Database connection failed"**
- Run `npx prisma generate` in backend folder
- Check `DATABASE_URL` in backend/.env
- For SQLite: Ensure file path is correct
- For PostgreSQL: Verify credentials and server is running

**"Login failed" / Invalid credentials**
- Run `npm run seed` in backend folder to create test user
- Use: test@powerfulcrm.com / test123

**"Cannot find module '@prisma/client'"**
```bash
cd backend
npx prisma generate
```

**"Port already in use"**
```powershell
# Find process using port 5173 or 8000
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F
```

**"Azure OpenAI authentication failed"**
- Verify `AZURE_OPENAI_KEY` in backend/.env
- Check `AZURE_OPENAI_ENDPOINT` ends with trailing slash
- Ensure deployment name matches: `Phi-4-mini-instruct`

For more help, see:
- [Main README](../README.md)
- [Backend README](../backend/README.md)
- [GITHUB_SECRETS.md](../GITHUB_SECRETS.md)
- [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)

---

## 📚 Additional Resources

- **[Main README](../README.md)** - Complete project setup
- **[Backend README](../backend/README.md)** - Backend-specific docs
- **[GITHUB_SECRETS.md](../GITHUB_SECRETS.md)** - API keys and secrets configuration
- **[Architecture Documentation](../docs/ARCHITECTURE.md)** - System design
- **[Development Guide](../docs/DEVELOPMENT.md)** - Development workflow
- **[Deployment Guide](../docs/DEPLOYMENT.md)** - Production deployment
- **[Telnyx API Docs](https://developers.telnyx.com)** - Phone system
- **[Azure Speech Docs](https://docs.microsoft.com/azure/cognitive-services/speech-service/)** - Voice services
- **[Azure OpenAI Docs](https://learn.microsoft.com/azure/ai-services/openai/)** - AI chat

---

## 🚀 Deployment

### Azure Container Apps (Recommended)

See **[GITHUB_SECRETS.md](../GITHUB_SECRETS.md)** for GitHub Actions secrets configuration.

**Deployment Steps:**
1. Configure all required secrets in GitHub repository settings
2. Push to `master` branch to trigger CI/CD pipeline
3. GitHub Actions builds and deploys automatically

### Manual Deployment

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Deploy to Azure, Railway, or other hosting providers
# See docs/DEPLOYMENT.md for detailed instructions
```

---

---

## 🎉 You're Ready!

Your AI CRM Call Center is ready to go. Start by:

1. ✅ Complete setup following [Main README](../README.md)
2. ✅ Login with test@powerfulcrm.com / test123
3. ✅ Configure API keys (optional for full features)
4. ✅ Testing Lead Finder
5. ✅ Creating qualification categories
6. ✅ Setting up your first campaign
7. ✅ Launching autopilot mode

Questions? Check the documentation:
- [Main README](../README.md) - Complete setup guide
- [GITHUB_SECRETS.md](../GITHUB_SECRETS.md) - API configuration
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System design
- [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) - Development guide

**Developed By:** Eli Ize (ST10129307)  
**Repository:** https://github.com/eli-ize/powerful-crm

**Happy automating! 🤖📞**
