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

1. **Telnyx** - https://telnyx.com
   - For voice calls and SMS
   - ~$5/month for phone number + $0.004/min for calls

2. **Google Cloud Platform** - https://console.cloud.google.com
   - Enable Places API
   - $200 free credit/month

3. **Azure** - https://azure.microsoft.com
   - Cognitive Services (Speech)
   - ~$1-10/month depending on usage

4. **OpenAI** - https://platform.openai.com
   - GPT-4 API access
   - Pay-as-you-go pricing

5. **Hunter.io** (Optional) - https://hunter.io
   - Email finder
   - Free tier: 25 searches/month

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# Google Places API
GOOGLE_PLACES_API_KEY=your_key_here

# Telnyx
TELNYX_API_KEY=KEY...
TELNYX_PHONE_NUMBER=+15551234567

# Azure Cognitive Services
AZURE_SPEECH_KEY=your_key_here
AZURE_SPEECH_REGION=eastus

# OpenAI
OPENAI_API_KEY=sk-...

# Hunter.io (Optional)
HUNTER_API_KEY=your_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crm

# Redis
REDIS_URL=redis://localhost:6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Create database
createdb crm

# Run migrations (if using Prisma)
npx prisma migrate dev

# Or manually create tables using schema in ARCHITECTURE.md
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 📱 Current Demo Mode

The current version runs in **demo mode** with simulated data:

### ✅ What Works (Demo):
- Full UI for all features
- Lead Finder (mock data)
- Lead Qualification system
- Campaign management
- Virtual Agents dashboard
- Contacts, Deals, Activities
- Analytics & Reporting

### ⚠️ What Needs Backend:
- **Real Google Places API calls** - Blocked by CORS in browser
- **Real AI calling** - Requires backend server + Azure/OpenAI
- **Real SMS/Calls** - Telnyx API needs backend
- **Database persistence** - Currently using localStorage
- **Multi-user system** - Needs authentication backend

## 🔧 Production Setup

### Option 1: Next.js (Recommended)

```bash
# Create Next.js API routes
mkdir -p app/api

# Add API routes as shown in ARCHITECTURE.md:
# - app/api/calls/route.ts
# - app/api/sms/route.ts  
# - app/api/places/search/route.ts
# - app/api/campaigns/route.ts
# etc.
```

### Option 2: Node.js + Express

See `/ARCHITECTURE.md` for complete backend implementation examples.

### Option 3: Python FastAPI

See `/ARCHITECTURE.md` for Python backend setup.

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

### CORS Errors
- Google Places API and Telnyx cannot be called from browser
- Solution: Create backend API routes

### Call Not Connecting
- Check Telnyx phone number is configured
- Verify API key is correct
- Check webhook URLs are accessible

### AI Not Responding
- Verify Azure Speech credentials
- Check OpenAI API key quota
- Review campaign AI instructions

## 📚 Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Telnyx API Docs](https://developers.telnyx.com)
- [Azure Speech Docs](https://docs.microsoft.com/azure/cognitive-services/speech-service/)
- [OpenAI API Docs](https://platform.openai.com/docs)

## 🚀 Deployment

### Vercel (Frontend + API Routes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Railway (Backend + Database)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up

# Add PostgreSQL + Redis via Railway dashboard
```

## 📝 License

MIT

---

## 🎉 You're Ready!

Your AI CRM Call Center is ready to go. Start by:

1. ✅ Adding API keys in Settings → API Setup
2. ✅ Testing Lead Finder
3. ✅ Creating qualification categories
4. ✅ Setting up your first campaign
5. ✅ Launching virtual agents

Questions? Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed implementation guidance.

**Happy automating! 🤖📞**
