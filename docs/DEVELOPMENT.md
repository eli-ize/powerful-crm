# Development Guide

**Complete guide for local development of Powerful CRM**

---

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/yourorg/powerful-crm.git
cd powerful-crm

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# 4. Initialize database
cd backend
npx prisma migrate dev
npx prisma generate
cd ..

# 5. Start development servers
npm run dev        # Frontend (port 5173)
npm run dev:backend # Backend (port 8000)

# 6. Open browser
# http://localhost:5173
```

---

## ⚙️ Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Included with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Optional Tools

| Tool | Purpose | Download |
|------|---------|----------|
| ngrok | Webhook testing | [ngrok.com](https://ngrok.com/) |
| Postman | API testing | [postman.com](https://postman.com/) |
| VS Code | IDE | [code.visualstudio.com](https://code.visualstudio.com/) |

---

## 🔧 Environment Setup

### 1. API Keys

You'll need accounts and API keys for:

#### Azure OpenAI (Required for AI chat)
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create Azure OpenAI resource in South Africa North
3. Deploy Phi-4-mini-instruct model
4. Get API key and endpoint URL

#### Azure Speech (Required for voice calls)
1. In Azure Portal, create Speech Services resource
2. Choose South Africa North region
3. Get API key

#### Telnyx (Required for phone calls)
1. Sign up at [telnyx.com](https://telnyx.com/)
2. Get API key from dashboard
3. Purchase a phone number
4. Note your Connection ID

---

### 2. Backend Environment File

Create `backend/.env`:

```env
# ============================================
# CORE CONFIGURATION
# ============================================
NODE_ENV=development
PORT=8000
HOST=0.0.0.0

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# ============================================
# DATABASE
# ============================================
# Development (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Production (PostgreSQL)
# DATABASE_URL="postgresql://user:password@host:5432/powerfulcrm?schema=public"

# ============================================
# AZURE OPENAI (AI Chat)
# ============================================
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_ENDPOINT=https://ai-cunsuh8hh96-aoai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=phi-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# ============================================
# AZURE SPEECH (Voice)
# ============================================
AZURE_SPEECH_KEY=your-key-here
AZURE_SPEECH_REGION=southafricanorth

# Voice configuration
AZURE_SPEECH_VOICE_NAME=en-ZA-LukeNeural
AZURE_SPEECH_LANGUAGE=en-ZA

# ============================================
# TELNYX (Phone Calls)
# ============================================
TELNYX_API_KEY=your-key-here
TELNYX_CONNECTION_ID=your-connection-id
TELNYX_PUBLIC_KEY=your-public-key
TELNYX_FROM_NUMBER=+27123456789

# Webhook URL (use ngrok in development)
TELNYX_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/telnyx/webhook

# ============================================
# COST CONTROL
# ============================================
DAILY_COST_LIMIT=10.00
MONTHLY_COST_LIMIT=100.00
AUTO_PAUSE_ON_LIMIT=true

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# ============================================
# SECURITY
# ============================================
JWT_SECRET=your-random-secret-here-min-32-chars
SESSION_SECRET=another-random-secret-here

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

### 3. Frontend Environment File (Optional)

Create `.env` in root:

```env
# API Base URL
VITE_API_URL=http://localhost:8000

# Feature flags
VITE_ENABLE_VOICE_TESTING=true
VITE_ENABLE_CHAT_TESTING=true
```

---

## 📦 Installation

### Full Installation

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# This installs:
# - React, TypeScript, Vite (frontend)
# - Express, Socket.IO, Prisma (backend)
# - Azure SDK, Telnyx SDK
# - Testing frameworks (Jest, Vitest)
```

### Dependency Breakdown

**Frontend (`package.json`):**
- `react@18.3.1` - UI framework
- `typescript@5.x` - Type safety
- `vite@6.3.5` - Build tool
- `tailwindcss@3.4.17` - Styling
- `@radix-ui/*` - Accessible components
- `@tanstack/react-query@5.x` - Data fetching

**Backend (`backend/package.json`):**
- `express@4.18` - REST API
- `socket.io@4.7` - WebSocket
- `@prisma/client@5.5` - Database ORM
- `@azure/openai@2.x` - AI integration
- `microsoft-cognitiveservices-speech-sdk@1.x` - Speech
- `telnyx@2.x` - Telephony
- `winston@3.x` - Logging

---

## 🗄️ Database Setup

### Initialize Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Optional: Seed with sample data
npx prisma db seed
```

### Database Commands

```bash
# Create new migration after schema changes
npx prisma migrate dev --name add_new_field

# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Schema Location

**File:** `backend/prisma/schema.prisma`

**Edit schema:**
```prisma
model Contact {
  id    String @id @default(cuid())
  name  String
  email String?
  phone String
  // Add new fields here
}
```

**Apply changes:**
```bash
npx prisma migrate dev --name describe_your_change
```

---

## 🏃 Running the Application

### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Frontend:**
```bash
npm run dev

# Output:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**Terminal 2 - Backend:**
```bash
npm run dev:backend

# Output:
# ✅ Server started on port 8000
# ✅ Socket.IO initialized
# ✅ Database connected
```

**Terminal 3 - Ngrok (for webhook testing):**
```bash
ngrok http 8000

# Copy HTTPS URL and update TELNYX_WEBHOOK_URL in .env
```

---

### Option 2: Concurrent Mode

```bash
# Runs both frontend and backend simultaneously
npm run dev:all
```

---

### Option 3: Docker (Production-like)

```bash
# Build and start containers
docker-compose up --build

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Database: PostgreSQL on port 5432
```

---

## 🧪 Testing

### Unit Tests

```bash
# Backend tests (Jest)
cd backend
npm test

# Run specific test file
npm test -- server.test.ts

# With coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Test API endpoints
cd backend
npm run test:integration

# Test specific endpoint
npm test -- routes/ai-chat.test.ts
```

### Frontend Tests

```bash
# Component tests (Vitest)
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

---

### Zero-Cost Testing (No API calls)

#### 1. Browser Chat Tester

**Purpose:** Test AI conversations without phone calls

```bash
# Open in browser
open ai-chat-tester.html

# Or start from backend
cd backend
npm run test:chat
```

**Features:**
- Pre-built scenarios (sales, support, objections)
- Real-time AI responses
- Sentiment analysis
- Conversation analytics
- Zero cost (no Telnyx or Azure Speech charges)

**Cost Savings:** $0.50 per test × 100 tests = $50 saved

---

#### 2. Mock Mode

Enable mock mode to test without API calls:

```typescript
// backend/src/config.ts
export const config = {
  mockMode: process.env.MOCK_MODE === 'true',
  mockAI: true,
  mockSpeech: true,
  mockTelnyx: false // Keep real for webhook testing
};
```

```bash
# Run with mocks
MOCK_MODE=true npm run dev:backend
```

---

## 🔍 Debugging

### Backend Debugging

**VS Code Launch Configuration:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/server.ts",
      "preLaunchTask": "npm: build:backend",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**Console Debugging:**
```bash
# Enable debug logs
LOG_LEVEL=debug npm run dev:backend

# Node.js inspector
node --inspect backend/dist/server.js

# Then open chrome://inspect in Chrome
```

---

### Frontend Debugging

**Browser DevTools:**
- Press `F12` to open DevTools
- Check Console for errors
- Network tab for API calls
- React DevTools extension for component state

**Redux DevTools:**
```bash
# If using Redux (not currently)
npm install --save-dev @redux-devtools/extension
```

---

### Common Debug Scenarios

**Socket.IO Connection Issues:**
```javascript
// Enable verbose logging
import io from 'socket.io-client';

const socket = io('http://localhost:8000', {
  transports: ['websocket', 'polling'],
  debug: true
});

socket.on('connect', () => console.log('✅ Connected'));
socket.on('connect_error', (err) => console.error('❌ Error:', err));
```

**Azure OpenAI Errors:**
```typescript
// Check exact error response
try {
  await azureOpenAI.generateChatCompletion({ messages });
} catch (error) {
  console.error('Full error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });
}
```

**Database Query Issues:**
```bash
# Enable query logging
npx prisma studio  # Visual database browser

# Or in code:
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

---

## 🔄 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/ai-voice-cloning

# Make changes
# ... edit files ...

# Test locally
npm run dev:all
npm test

# Commit
git add .
git commit -m "feat: Add AI voice cloning feature"

# Push
git push origin feature/ai-voice-cloning

# Create Pull Request on GitHub
```

---

### 2. Code Quality

**Linting:**
```bash
# Check for issues
npm run lint

# Auto-fix
npm run lint:fix
```

**Type Checking:**
```bash
# Frontend
npm run type-check

# Backend
cd backend
npm run type-check
```

**Formatting:**
```bash
# Format all files
npm run format

# Check without modifying
npm run format:check
```

---

### 3. Database Migrations

```bash
# When you modify prisma/schema.prisma:

# 1. Create migration
npx prisma migrate dev --name add_user_preferences

# 2. Test migration
npm run dev:backend

# 3. If issues, rollback
npx prisma migrate reset

# 4. Fix and retry
npx prisma migrate dev
```

---

## 🛠️ Useful Scripts

### Package.json Scripts

**Root package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "dev:backend": "cd backend && npm run dev",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:backend\"",
    "build": "vite build",
    "build:backend": "cd backend && npm run build",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\""
  }
}
```

**Backend package.json:**
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "prisma migrate dev",
    "studio": "prisma studio"
  }
}
```

---

### Custom Development Scripts

**Quick test outbound call:**
```bash
# Test call without opening CRM
node backend/scripts/test-call.js +27123456789
```

**Warm up AI (reduce first-call latency):**
```bash
node backend/scripts/warmup-ai.js
```

**Check Telnyx webhook routing:**
```bash
node backend/scripts/check-telnyx-routing.js
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

---

### Database Connection Errors

```bash
# Reset database
cd backend
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

---

### API Key Issues

```bash
# Verify Azure OpenAI key
curl -X POST "https://ai-cunsuh8hh96-aoai.openai.azure.com/openai/deployments/phi-4/chat/completions?api-version=2024-02-15-preview" \
  -H "api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Should return JSON response, not 401 Unauthorized
```

---

### Module Not Found Errors

```bash
# Clear all node_modules and reinstall
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install
```

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and tech stack
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide
- **[API_REFERENCE.md](API_REFERENCE.md)** - API endpoints documentation
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

---

**Last Updated:** 2025  
**Maintained By:** Powerful CRM Development Team
