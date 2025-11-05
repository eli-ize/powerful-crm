# System Architecture

**Complete technical architecture of the Powerful CRM AI sales automation platform**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + TailwindCSS + Radix UI                 │
│  • CRM Dashboard                                                │
│  • Call Management Interface                                    │
│  • Real-time Voice/Chat Testing                                 │
│  • Analytics & Reporting                                        │
└────────────┬────────────────────────────────────────────────────┘
             │ HTTPS / WebSocket
┌────────────▼────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Node.js 18+ + Express + Socket.IO                              │
│  • REST API (Express routes)                                    │
│  • WebSocket server (real-time audio/chat)                      │
│  • Middleware (auth, cost guards, logging)                      │
│  • Service layer (AI, speech, telephony)                        │
└────────────┬────────────────────────────────────────────────────┘
             │
      ┌──────┴──────┬──────────┬──────────┬──────────┐
      │             │          │          │          │
┌─────▼─────┐ ┌────▼────┐ ┌───▼────┐ ┌───▼────┐ ┌──▼──────┐
│   Azure   │ │  Azure  │ │ Telnyx │ │ Azure  │ │ Ngrok   │
│  OpenAI   │ │ Speech  │ │  API   │ │ PostDB │ │(Dev)    │
│ (Phi-4)   │ │ (TTS/   │ │(Voice) │ │        │ │         │
│           │ │  STT)   │ │        │ │        │ │         │
└───────────┘ └─────────┘ └────────┘ └────────┘ └─────────┘
```

---

## 🎯 Core Components

### 1. Frontend Application

**Location:** `/src/`

**Stack:**
- React 18.3.1 with TypeScript 5.x
- Vite 6.3.5 (build tool)
- TailwindCSS 3.4.17 (styling)
- Radix UI (accessible components)
- TanStack Query (data fetching)

**Key Features:**
- **CRM Dashboard:** Contact management, deal pipeline
- **Call Management:** Initiate calls, real-time monitoring
- **Voice Testing:** Browser-based voice chat with AI
- **Chat Testing:** Zero-cost text-based AI conversation testing
- **Analytics:** Call logs, sentiment analysis, performance metrics

**Build Output:**
```
build/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

---

### 2. Backend Application

**Location:** `/backend/src/`

**Stack:**
- Node.js 18+ with TypeScript 5.x
- Express 4.18 (REST API)
- Socket.IO 4.7 (WebSocket)
- Prisma 5.5 (ORM)
- Jest 29.7 (testing)

**Directory Structure:**
```
backend/src/
├── server.ts              # Main server entry point
├── routes/
│   ├── ai-chat.ts        # AI chat API endpoints
│   ├── telnyx.ts         # Telnyx webhook handlers
│   ├── speech.ts         # Azure Speech endpoints
│   └── admin/            # Admin API routes
├── services/
│   ├── azureOpenAI.ts    # Azure OpenAI integration
│   ├── azureSpeech.ts    # Azure Speech TTS/STT
│   ├── telnyx.ts         # Telnyx telephony service
│   ├── voiceCallHandler.ts  # Call orchestration
│   └── costTracking.ts   # Cost monitoring service
├── middleware/
│   ├── auth.ts           # Authentication
│   ├── costGuard.ts      # Spending limits
│   └── logger.ts         # Winston logging
└── utils/
    └── sentiment.ts      # Emotion detection
```

**Server Configuration:**
```typescript
{
  port: 8000,
  host: '0.0.0.0',
  cors: {
    origin: ['http://localhost:5173', 'https://yourdomain.com'],
    credentials: true
  },
  socketIO: {
    pingTimeout: 60000,
    pingInterval: 25000
  }
}
```

---

### 3. AI Services Integration

#### Azure OpenAI (Johannesburg)

**Model:** Phi-4-mini-instruct  
**Endpoint:** `https://ai-cunsuh8hh96-aoai.openai.azure.com/`  
**Location:** South Africa North (Johannesburg)

**Usage:**
```typescript
import azureOpenAIService from './services/azureOpenAI';

const response = await azureOpenAIService.generateChatCompletion({
  messages: [
    { role: 'system', content: 'You are a professional sales assistant...' },
    { role: 'user', content: 'Tell me about your services' }
  ]
});

console.log(response.content); // AI response text
```

**Configuration:**
```env
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_ENDPOINT=https://ai-cunsuh8hh96-aoai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=phi-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Cost:** ~$0.15 per 1000 tokens (~750 words)

---

#### Azure Speech Services

**Location:** South Africa North (Johannesburg)  
**Services:** Text-to-Speech (TTS) + Speech-to-Text (STT)

**TTS Configuration:**
```typescript
{
  voice: 'en-ZA-LukeNeural',      // Male South African voice
  outputFormat: 'audio-16khz-32kbitrate-mono-mp3',
  rate: '+0%',                     // Natural speaking speed
  pitch: '+0%'                     // Natural pitch
}
```

**STT Configuration:**
```typescript
{
  language: 'en-ZA',               // South African English
  format: 'simple',                // Simple JSON response
  profanityOption: 'masked'        // Mask profanity
}
```

**Cost:** ~$0.05 per call (30 sec TTS + 30 sec STT)

---

#### Telnyx Voice API

**Purpose:** Phone call infrastructure (SIP trunking, WebRTC)

**Capabilities:**
- Outbound call initiation
- Inbound call handling
- Real-time audio streaming
- Call control (transfer, hold, hangup)
- SMS messaging

**Configuration:**
```env
TELNYX_API_KEY=your-key-here
TELNYX_CONNECTION_ID=your-connection-id
TELNYX_PUBLIC_KEY=your-public-key
TELNYX_FROM_NUMBER=+27-your-number
```

**Webhook URL:** `https://your-ngrok-url.ngrok.io/api/telnyx/webhook`

**Cost:** $0.02/minute (outbound calls)

---

### 4. Database Layer

**ORM:** Prisma 5.5.2  
**Development:** SQLite (`./prisma/dev.db`)  
**Production:** PostgreSQL (Azure Flexible Server)

**Schema Overview:**
```prisma
// Core Models
model Contact {
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String
  status      String   @default("active")
  createdAt   DateTime @default(now())
  calls       Call[]
  deals       Deal[]
}

model Call {
  id            String   @id @default(cuid())
  contactId     String
  contact       Contact  @relation(fields: [contactId], references: [id])
  status        String   // 'completed', 'missed', 'in-progress'
  duration      Int?     // seconds
  transcript    String?
  sentiment     String?  // 'positive', 'neutral', 'negative'
  outcome       String?  // 'interested', 'not_interested', 'callback'
  cost          Float?   // USD
  createdAt     DateTime @default(now())
}

model Deal {
  id          String   @id @default(cuid())
  contactId   String
  contact     Contact  @relation(fields: [contactId], references: [id])
  title       String
  value       Float
  stage       String   // 'lead', 'qualified', 'proposal', 'closed'
  probability Int      // 0-100%
  createdAt   DateTime @default(now())
}

// Cost Tracking
model ApiUsage {
  id            String   @id @default(cuid())
  service       String   // 'openai', 'speech_tts', 'speech_stt', 'telnyx'
  cost          Float    // USD
  tokens        Int?     // For AI services
  duration      Int?     // For voice services (seconds)
  createdAt     DateTime @default(now())
}

model UserConfig {
  id                String   @id @default(cuid())
  dailyLimit        Float    @default(10.00)   // USD
  monthlyLimit      Float    @default(100.00)  // USD
  autoPause         Boolean  @default(true)
  createdAt         DateTime @default(now())
}
```

**Migrations:**
```bash
# Development
npm run migrate:dev

# Production
npm run migrate:deploy
```

---

## 🔄 Data Flow

### Outbound Call Flow

```
1. User initiates call from CRM dashboard
   ↓
2. Backend receives request → validates cost limits
   ↓
3. Telnyx API creates outbound call
   ↓
4. Call connects → Telnyx sends webhook to backend
   ↓
5. Backend establishes Socket.IO connection with frontend
   ↓
6. Azure Speech TTS generates greeting audio
   ↓
7. Audio sent to Telnyx → played to customer
   ↓
8. Customer speaks → Telnyx streams audio to backend
   ↓
9. Azure Speech STT transcribes audio to text
   ↓
10. Sentiment analysis detects emotion
   ↓
11. Azure OpenAI generates contextual response
   ↓
12. Azure Speech TTS converts response to audio
   ↓
13. Loop continues until call ends or goal achieved
   ↓
14. Call metadata saved to database (transcript, cost, outcome)
```

### Browser Chat Test Flow (Zero Cost)

```
1. User opens ai-chat-tester.html in browser
   ↓
2. Selects scenario (sales, support, objection handling)
   ↓
3. Types message → sent via WebSocket to backend
   ↓
4. Backend routes to /api/ai-chat endpoint
   ↓
5. Azure OpenAI processes message with context
   ↓
6. Response sent back via WebSocket
   ↓
7. Browser displays response in chat UI
   ↓
8. Repeat conversation without any telephony/speech costs
```

---

## 🌐 Network Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────┐
│  localhost:5173 (Frontend - Vite Dev Server)        │
│  ↓ HTTP/WS                                          │
│  localhost:8000 (Backend - Express + Socket.IO)     │
│  ↓ HTTPS                                            │
│  ngrok-tunnel.ngrok.io (Telnyx webhook endpoint)    │
└─────────────────────────────────────────────────────┘
```

**Ngrok Setup:**
```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 8000

# Copy HTTPS URL to Telnyx webhook configuration
# Example: https://abc123.ngrok.io/api/telnyx/webhook
```

---

### Production Environment (Azure)

```
┌──────────────────────────────────────────────────────┐
│  Azure Front Door (CDN + WAF)                        │
│  ├─ Static Assets (build/)                           │
│  └─ API Routes (/api/*)                              │
│     ↓                                                 │
│  Azure Container Apps (2 replicas)                   │
│  ├─ Container 1: Backend (Node.js)                   │
│  └─ Container 2: Backend (Node.js)                   │
│     ↓                                                 │
│  Azure PostgreSQL Flexible Server                    │
│  ├─ Database: powerfulcrm_prod                       │
│  └─ Connection: SSL required                         │
└──────────────────────────────────────────────────────┘
```

**Deployment:**
- **CI/CD:** GitHub Actions
- **Container Registry:** Azure Container Registry
- **Scaling:** Auto-scale 1-10 replicas based on CPU/memory
- **SSL:** Automatic via Azure (Let's Encrypt)
- **Monitoring:** Azure Application Insights

---

## 🔒 Security Architecture

### API Key Management

**Backend (.env file):**
```env
# Never commit to Git - use Azure Key Vault in production
AZURE_OPENAI_API_KEY=sk-...
AZURE_SPEECH_KEY=abcd1234...
TELNYX_API_KEY=KEY...
DATABASE_URL=postgresql://...
```

**Frontend (Runtime):**
```typescript
// API keys NEVER exposed to browser
// All AI/telephony calls proxied through backend
const response = await fetch('/api/ai-chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Hello' })
});
```

**Production (Azure Key Vault):**
```bash
# Store secrets in Key Vault
az keyvault secret set --vault-name powerfulcrm-kv \
  --name "AzureOpenAI-ApiKey" \
  --value "sk-..."

# Reference in Container App
env:
  - name: AZURE_OPENAI_API_KEY
    secretRef: azureopenai-apikey
```

---

### Authentication Flow

```
1. User logs in → backend validates credentials
   ↓
2. Backend generates JWT token (expires 7 days)
   ↓
3. Token stored in httpOnly cookie (secure, sameSite: strict)
   ↓
4. Frontend includes cookie in all requests automatically
   ↓
5. Backend middleware validates JWT on protected routes
   ↓
6. Invalid/expired token → 401 Unauthorized response
```

---

## 📊 Monitoring & Observability

### Logging (Winston)

```typescript
// Structured logging
logger.info('Call initiated', {
  callId: 'call_123',
  contactId: 'contact_456',
  duration: 0,
  status: 'connecting'
});

logger.error('AI service error', {
  error: err.message,
  service: 'azure-openai',
  retries: 3
});
```

**Log Levels:**
- `error`: System failures, API errors
- `warn`: Deprecations, high costs
- `info`: Call events, user actions
- `debug`: Detailed flow, variable values (dev only)

**Log Storage:**
- **Development:** `backend/logs/` (file rotation)
- **Production:** Azure Application Insights

---

### Cost Tracking

**Real-time Monitoring:**
```typescript
// Track every API call cost
await costTracking.trackUsage({
  service: 'azure-openai',
  cost: 0.0015,
  tokens: 150
});

// Check if over daily limit
const usage = await costTracking.getDailyUsage();
if (usage > limits.dailyLimit) {
  throw new Error('Daily spending limit exceeded');
}
```

**Dashboard Metrics:**
- Total spend today/month
- Cost per call average
- Most expensive services
- Budget burn rate
- Alerts when approaching limits

---

## 🚀 Performance Optimization

### Latency Targets

| Metric | Target | Actual |
|--------|--------|--------|
| AI Response Time | <800ms | ~650ms |
| TTS Generation | <500ms | ~400ms |
| STT Processing | <300ms | ~250ms |
| End-to-End Latency | <2s | ~1.8s |

### Optimization Strategies

**1. Connection Reuse:**
```typescript
// Reuse HTTP agents for faster requests
const https = require('https');
const agent = new https.Agent({ keepAlive: true });
axios.get(url, { httpsAgent: agent });
```

**2. Response Streaming:**
```typescript
// Stream AI responses instead of waiting for complete response
azureOpenAI.streamChatCompletion({
  messages,
  onToken: (token) => socket.emit('ai_token', token)
});
```

**3. Audio Buffering:**
```typescript
// Pre-buffer audio to reduce perceived latency
const audioBuffer = [];
ttsService.synthesize(text, (chunk) => {
  audioBuffer.push(chunk);
  if (audioBuffer.length > 3) {
    playAudio(audioBuffer.shift());
  }
});
```

---

## 📈 Scalability

### Horizontal Scaling

**Current:** Single server (dev)  
**Production:** 2-10 replicas with load balancer

**State Management:**
- **Sessions:** Redis (shared across replicas)
- **WebSockets:** Sticky sessions via Azure Front Door
- **Database:** Connection pooling (max 20 per replica)

### Vertical Scaling

**Development:**
- 1 vCPU, 2GB RAM
- SQLite database

**Production:**
- 2 vCPU, 4GB RAM per replica
- PostgreSQL (2 vCPU, 8GB RAM, 32GB SSD)

---

## 🔧 Technology Choices - Rationale

### Why Azure OpenAI?
✅ South Africa region available (low latency)  
✅ Enterprise SLA and compliance  
✅ Phi-4 model optimized for speed + quality  
✅ Cost-effective ($0.15/1000 tokens vs GPT-4 $30/1000)

### Why Telnyx over Twilio?
✅ 50% cheaper ($0.02/min vs $0.04/min)  
✅ Better WebRTC support  
✅ No hidden fees  
✅ South Africa phone numbers available

### Why Socket.IO over WebSockets?
✅ Auto-reconnection  
✅ Fallback to long-polling  
✅ Built-in room management  
✅ Easy event-based API

### Why Prisma over TypeORM?
✅ Type-safe queries  
✅ Excellent migration system  
✅ Intuitive schema definition  
✅ Better performance

---

## 📚 Related Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Local setup and development workflow
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation
- **[SECURITY.md](SECURITY.md)** - Security best practices
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

---

**Last Updated:** 2025  
**Maintained By:** Powerful CRM Development Team
