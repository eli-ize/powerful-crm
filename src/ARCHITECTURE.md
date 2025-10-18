# AI CRM - Universal Sales Platform Architecture

## Vision
A **UNIVERSAL AI-POWERED SALES AUTOMATION PLATFORM** that can sell ANY product or service in ANY industry. The system autonomously finds leads, qualifies them using custom criteria, and conducts intelligent cold calls using Azure AI services. 

**Industries Supported:** Web design, SaaS, consulting, call center services, digital marketing, accounting, e-commerce, real estate, insurance, IT services, legal tech, healthcare, education, manufacturing, and more.

The system features multiple AI virtual agents working alongside human users to automate the entire sales process from prospecting to closing.

## System Architecture

### 1. Core Modules

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI CRM SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │ Lead Finder │→ │ Qualification│→ │ Campaign Manager    │    │
│  │ (Google API)│  │ Engine       │  │ (Prospect Journeys) │    │
│  └─────────────┘  └──────────────┘  └─────────────────────┘    │
│                           ↓                     ↓                │
│                    ┌──────────────────────────────┐             │
│                    │   AI Call Center Engine      │             │
│                    │  (Azure TTS/STT + GPT)       │             │
│                    └──────────────────────────────┘             │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           Virtual Agent Management System             │      │
│  │  (Multiple AI agents, activity tracking, insights)    │      │
│  └──────────────────────────────────────────────────────┘      │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │        Multi-User System (Roles & Permissions)        │      │
│  │  (Admins, Managers, Sales Reps, AI Agents)            │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Lead Qualification Flow

```
1. Lead Discovery (Google Places API)
   ↓
2. Lead Enrichment (Find missing data via web scraping/APIs)
   ↓
3. Qualification Criteria Application
   - Has website? → Category: "Website Active"
   - No website? → Category: "No Website"
   - Outdated design? → Category: "Outdated Design"
   - Website broken? → Category: "Broken Website"
   - Only Facebook page? → Category: "Social Media Only"
   - Custom criteria...
   ↓
4. Manual/Auto Categorization
   ↓
5. Campaign Assignment (Check if already in campaign)
   ↓
6. Prospect Journey Tracking
```

### 3. AI Campaign System

#### Campaign Configuration
```typescript
interface Campaign {
  id: string;
  name: string;
  objective: string; // "Web design pitch", "App development", etc.
  
  // AI Voice Configuration
  voiceConfig: {
    provider: 'azure'; // Azure TTS
    voiceId: string; // e.g., "en-US-JennyNeural"
    tone: 'professional' | 'friendly' | 'enthusiastic' | 'casual';
    speed: number; // 0.8 - 1.2
    pitch: number; // -10 to +10
    enableMirroring: boolean; // Mirror client's speaking style
  };
  
  // AI Behavior Configuration
  aiInstructions: {
    personality: string; // "Professional web design consultant"
    objective: string; // "Book a discovery call"
    script: string; // Example conversation script
    maxCallDuration: number; // seconds
    
    // Decision rules
    qualificationCriteria: {
      interested: string[]; // Keywords/phrases indicating interest
      notInterested: string[]; // Keywords for rejection
      needsFollowup: string[];
    };
    
    // Post-call actions
    actionRules: {
      ifInterested: 'move_to_qualified' | 'schedule_meeting' | 'send_email';
      ifNotInterested: 'mark_dead' | 'schedule_followup';
      ifNoAnswer: 'retry' | 'mark_attempted';
      ifVoicemail: 'leave_message' | 'hang_up';
    };
  };
  
  // Campaign Limits
  limits: {
    maxProspectsPerDay: number;
    maxCallsPerHour: number;
    retryAttempts: number;
    retryInterval: number; // hours
  };
}
```

#### Call Processing Flow
```
1. AI dials prospect (Telnyx API)
   ↓
2. STT converts prospect speech to text (Azure Speech-to-Text)
   ↓
3. GPT-4 analyzes response + generates next dialogue
   ↓
4. TTS converts AI response to speech (Azure Text-to-Speech)
   ↓
5. Play audio to prospect
   ↓
6. Loop steps 2-5 until call ends
   ↓
7. Post-call analysis:
   - Generate call transcript
   - Extract insights (interest level, objections, pain points)
   - Decide next action based on campaign rules
   - Update lead status/category
   - Schedule follow-ups if needed
   - Generate summary for human review
```

### 4. Virtual Agent System

```typescript
interface VirtualAgent {
  id: string;
  name: string; // "Sarah (AI)", "John (AI)"
  type: 'ai_caller' | 'ai_qualifier' | 'ai_researcher';
  status: 'active' | 'idle' | 'calling' | 'researching';
  
  // Performance tracking
  stats: {
    callsMade: number;
    successRate: number;
    qualifiedLeads: number;
    averageCallDuration: number;
    hoursWorked: number;
  };
  
  // Current activity
  currentActivity: {
    campaign?: string;
    prospect?: string;
    startTime: Date;
    activity: string;
  };
  
  // Configuration
  assignedCampaigns: string[];
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
    timezone: string;
  };
}
```

### 5. Multi-User Role System

```typescript
type UserRole = 'super_admin' | 'admin' | 'manager' | 'sales_rep' | 'viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  
  permissions: {
    canManageUsers: boolean;
    canConfigureCampaigns: boolean;
    canManageVirtualAgents: boolean;
    canViewAllLeads: boolean;
    canExportData: boolean;
    canMakeCalls: boolean;
  };
  
  // For sales reps - assigned leads/campaigns
  assignments?: {
    campaigns: string[];
    leadCategories: string[];
  };
}
```

### 6. Database Schema

```
TABLES:

leads
  - id, company_name, phone, email, website, status
  - qualification_category (website_active, no_website, etc.)
  - qualification_reason (why they were categorized)
  - assigned_agent_id (human or AI)
  - created_at, updated_at

campaigns
  - id, name, type, status, ai_config (JSON), created_by
  - voice_config, ai_instructions, limits

campaign_prospects (junction table)
  - campaign_id, lead_id, status, added_at, added_by
  - journey_stage (new, contacted, interested, qualified, dead)

calls
  - id, lead_id, campaign_id, agent_id (can be virtual agent)
  - started_at, ended_at, duration, status
  - transcript (full conversation), insights (AI analysis)
  - call_recording_url, sentiment_score

virtual_agents
  - id, name, type, status, config, stats, current_activity

users
  - id, name, email, role, permissions, assignments

qualification_criteria
  - id, name, description, rules (JSON)
  - created_by, is_active
```

### 7. Technology Stack

#### Frontend
- React + TypeScript
- TailwindCSS for UI
- State management: React Context / Zustand
- Real-time updates: WebSockets

#### Backend (Required for Production)
- **Option 1:** Next.js 14 (App Router)
  - API Routes for all endpoints
  - Server-side session management
  - Middleware for auth & permissions
  
- **Option 2:** Node.js + Express
  - RESTful API
  - Socket.io for real-time
  - JWT authentication
  
- **Option 3:** Python FastAPI
  - Great for AI integration
  - WebSocket support
  - Async by default

#### AI Services
- **Azure Cognitive Services**
  - Speech-to-Text (STT)
  - Text-to-Speech (TTS)
  - Language Understanding (LUIS) - optional
  
- **OpenAI GPT-4**
  - Conversation management
  - Intent detection
  - Post-call analysis
  
- **Optional:** Azure OpenAI Service
  - Same as OpenAI but on Azure infrastructure

#### Telephony
- **Telnyx** (current choice)
  - Voice API for calls
  - SMS for follow-ups
  - Call recording
  - Webhook support

#### Data Enrichment
- Google Places API (business data)
- Hunter.io (email finding)
- Clearbit (company data)
- Custom web scraping (website analysis)

### 8. Key API Endpoints

```
Authentication & Users
POST   /api/auth/login
POST   /api/auth/register
GET    /api/users
POST   /api/users (create user)
PATCH  /api/users/:id (update role/permissions)

Leads & Qualification
GET    /api/leads
POST   /api/leads/import (from Lead Finder)
PATCH  /api/leads/:id/qualify (set category)
GET    /api/leads/categories
POST   /api/leads/categories (create new criteria)

Campaigns
GET    /api/campaigns
POST   /api/campaigns (create campaign)
PATCH  /api/campaigns/:id
POST   /api/campaigns/:id/prospects (add leads to campaign)
GET    /api/campaigns/:id/prospects (check if already added)
DELETE /api/campaigns/:id/prospects/:leadId

AI Call Center
POST   /api/calls/initiate (start AI call)
GET    /api/calls/:id/status
GET    /api/calls/:id/transcript
GET    /api/calls/:id/insights
POST   /api/calls/:id/webhook (Telnyx callback)

Virtual Agents
GET    /api/agents
POST   /api/agents (create new AI agent)
PATCH  /api/agents/:id/status (activate/pause)
GET    /api/agents/:id/stats
GET    /api/agents/:id/activity (current/recent activity)

Analytics & Reporting
GET    /api/analytics/campaigns
GET    /api/analytics/agents
GET    /api/analytics/conversion-rates
GET    /api/reports/export
```

### 9. AI Call Flow Implementation

```typescript
// Simplified version of how AI calling would work

async function initiateAICall(prospect, campaign) {
  // 1. Start call via Telnyx
  const call = await telnyx.calls.create({
    to: prospect.phone,
    from: campaign.phoneNumber,
    webhook_url: 'https://yourapp.com/api/calls/webhook'
  });
  
  // 2. When call connects, start conversation
  const conversation = new AIConversation({
    campaign: campaign,
    prospect: prospect,
    stt: new AzureSTT(config.azureSTT),
    tts: new AzureTTS(config.azureTTS),
    llm: new OpenAI(config.openai)
  });
  
  // 3. Play initial greeting
  await conversation.speak(campaign.aiInstructions.script.greeting);
  
  // 4. Listen and respond loop
  while (call.isActive) {
    const prospectSpeech = await conversation.listen();
    const aiResponse = await conversation.decide(prospectSpeech);
    await conversation.speak(aiResponse);
    
    // Check if should end call
    if (aiResponse.endCall) break;
  }
  
  // 5. Post-call processing
  const insights = await conversation.analyze();
  const nextAction = campaign.aiInstructions.actionRules[insights.outcome];
  
  // 6. Execute action
  await executeAction(prospect, nextAction, insights);
  
  // 7. Save everything
  await saveCallRecord({
    prospect, campaign,
    transcript: conversation.getTranscript(),
    insights: insights,
    duration: conversation.getDuration(),
    recording: call.recordingUrl
  });
}
```

### 10. Development Phases

**Phase 1: Foundation (Current)**
- ✅ Basic CRM structure
- ✅ Lead Finder integration
- ✅ Telnyx setup

**Phase 2: Qualification System (Next)**
- Lead categorization UI
- Custom qualification criteria
- Bulk operations
- Category management

**Phase 3: Campaign Management**
- Campaign creation UI
- Prospect journey tracking
- Duplicate detection
- Bulk campaign assignment

**Phase 4: AI Configuration**
- Campaign AI settings
- Voice configuration
- Script builder
- Decision rules

**Phase 5: Virtual Agents**
- Agent creation/management
- Activity dashboard
- Performance metrics
- Multi-agent coordination

**Phase 6: AI Calling (Backend Required)**
- Azure TTS/STT integration
- OpenAI conversation engine
- Telnyx call orchestration
- Real-time transcription

**Phase 7: Multi-User System**
- Role-based access control
- User management
- Activity logging
- Permissions system

**Phase 8: Analytics & Insights**
- Campaign performance
- Agent performance
- Call analytics
- ROI tracking

### 11. Deployment Architecture

```
Optimal Production Setup (Azure Free Tier):

┌─────────────────────────────────────────────────────────────┐
│                    Azure Container Apps                      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │   Backend    │  │   Workers    │      │
│  │ (Static Web  │←→│ (Container   │←→│ (AI Calls)   │      │
│  │    Apps)     │  │    Apps)     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│          ↓                ↓                  ↓               │
└──────────|────────────────|──────────────────|───────────────┘
           │                │                  │
      ┌────┴────────────────┴──────────────────┴────┐
      │                                              │
┌─────▼─────┐  ┌─────────────┐  ┌────────────────┐ │
│ Azure DB  │  │ Azure Cache │  │ Azure Storage  │ │
│PostgreSQL │  │ for Redis   │  │ (Recordings)   │ │
│(FREE Tier)│  │(FREE Tier)  │  │(FREE Tier)     │ │
└───────────┘  └─────────────┘  └────────────────┘ │
      │                                              │
┌─────▼──────────────────────────────────────────────▼───────┐
│           Azure Cognitive Services (FREE Tier)              │
│  - Speech (TTS/STT)         - Azure OpenAI Service          │
│  - Language Understanding   - Computer Vision (optional)     │
└─────────────────────────────────────────────────────────────┘
           ↓                              ↓
┌──────────────┐              ┌──────────────┐
│   Telnyx     │              │  External    │
│ (Calls/SMS)  │              │  APIs        │
└──────────────┘              └──────────────┘

MONTHLY COST: $0-15 (vs $200+ other clouds)
```

### 12. Security Considerations

- All API keys stored in environment variables
- Backend-only API calls (never from frontend)
- Role-based access control (RBAC)
- Audit logging for all actions
- Encrypted storage for call recordings
- GDPR compliance for lead data
- Rate limiting on all endpoints
- WebSocket authentication

### 13. Monitoring & Observability

- **Azure Application Insights** (FREE tier) - Error tracking, performance monitoring
- **Azure Monitor** (FREE tier) - System health, metrics, alerts
- **Azure Log Analytics** (FREE tier) - Centralized logging
- **Custom dashboards for:**
  - Active calls and AI agent activity
  - System health and performance
  - Cost tracking (API usage optimization)
  - User engagement and conversion metrics

**Cost: $0/month** (vs $100+/month with third-party tools)

---

## Getting Started for Future Development

When you download this project and want to continue development:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables (.env.local):**
   ```
   # Azure Services (FREE Tier)
   AZURE_SPEECH_KEY=your_speech_key
   AZURE_SPEECH_REGION=eastus
   AZURE_OPENAI_KEY=your_openai_key
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
   
   # Database (Azure PostgreSQL FREE)
   DATABASE_URL=postgresql://user:pass@your-server.postgres.database.azure.com:5432/db
   
   # Cache (Azure Redis FREE)
   REDIS_URL=rediss://:password@your-cache.redis.cache.windows.net:6380
   
   # External APIs
   GOOGLE_PLACES_API_KEY=AIza...
   TELNYX_API_KEY=KEY...
   
   # Application Insights (FREE)
   APPINSIGHTS_INSTRUMENTATIONKEY=your_key
   ```

3. **Review this architecture document**

4. **Check the current implementation in:**
   - `/components/crm/*` - All CRM features
   - `/ARCHITECTURE.md` - This file
   - `/components/crm/campaigns/*` - Campaign system (to be built)
   - `/components/crm/virtual-agents/*` - AI agents (to be built)

5. **Next steps:** Implement Phase 2 (Qualification System)

---

This architecture supports your complete vision of an autonomous AI call center!
