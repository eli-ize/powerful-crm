# 🚀 Testing Guide - Powerful CRM

## ✅ Current Status

**Backend Server:** Running on http://localhost:8000
**Frontend Server:** Running on http://localhost:3001

---

## 📋 What We've Built

### Backend Services (Node.js + Express + TypeScript)
- ✅ Google Places API integration for lead finding
- ✅ Azure Speech Service integration for TTS/STT
- ✅ Azure OpenAI Service for conversational AI
- ✅ Telnyx telephony integration for voice calls
- ✅ Prisma ORM with comprehensive database schema
- ✅ RESTful API with authentication, contacts, campaigns, calls, etc.

### Frontend Features (React + TypeScript + Vite)
- ✅ API utility client for backend communication
- ✅ ApiTester component for testing integrations
- ✅ Full CRM dashboard with contacts, deals, campaigns
- ✅ Virtual agents and automation features
- ✅ Real-time call handling interface

---

## 🧪 How to Test the Integration

### 1. Access the Application
Open your browser and navigate to:
```
http://localhost:3001
```

### 2. Login
Use the demo login (authentication is mocked for now):
- **Email:** any@example.com
- **Password:** any password

### 3. Navigate to API Tester
From the main dashboard, navigate to the API Setup or API Tester page.

### 4. Test Google Places API

**Prerequisites:**
- You need a Google Places API key
- Add it to `backend/.env` as `GOOGLE_PLACES_API_KEY=your_key_here`

**Testing Steps:**
1. In the API Tester component, enter a search query like:
   - "restaurants in New York"
   - "coffee shops in San Francisco"
   - "hotels in Miami"

2. Click "Search Places"

3. The component will display:
   - Business names
   - Addresses
   - Phone numbers
   - Websites
   - Ratings and reviews
   - Business types

4. Click "Import as Contacts" to bulk import leads into your CRM

---

## 🔑 Required API Keys

Create a `backend/.env` file with these variables:

```env
# Required for testing
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Optional but recommended
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=eastus

AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

TELNYX_API_KEY=your_telnyx_api_key
TELNYX_PUBLIC_KEY=your_telnyx_public_key

# Database (required for production)
DATABASE_URL=postgresql://user:password@localhost:5432/powerful_crm
```

---

## 🎯 Testing Each Feature

### Test 1: Backend Health Check
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T...",
  "service": "Powerful CRM API"
}
```

### Test 2: Google Places Search
```bash
curl -X GET "http://localhost:8000/api/places/search?query=restaurants%20in%20new%20york"
```

### Test 3: Create Contact
```bash
curl -X POST http://localhost:8000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Test Company"
  }'
```

### Test 4: Azure Speech Synthesis (requires API key)
```bash
curl -X POST http://localhost:8000/api/speech/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of Azure Speech Service",
    "voice": "en-US-AriaNeural"
  }' \
  --output test-audio.mp3
```

---

## 📊 Available API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Contacts (CRM)
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Places (Lead Finder)
- `GET /api/places/search?query=...&location=...` - Search businesses
- `POST /api/places/bulk-import` - Import multiple places as contacts

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign

### Calls (Telephony)
- `GET /api/calls` - List call logs
- `POST /api/calls` - Initiate outbound call

### Virtual Agents
- `GET /api/virtual-agents` - List AI agents
- `POST /api/virtual-agents` - Create agent

### System
- `GET /api/health` - Health check

---

## 🔧 Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npm run dev
```

### Frontend won't start
```bash
cd "U:\Powerful CRM"
npm install
npm run dev
```

### API calls failing
1. Check backend is running on port 8000
2. Check frontend CORS settings in `backend/src/server.ts`
3. Verify API keys are set in `backend/.env`
4. Check browser console for errors

### Database errors
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

---

## 🎉 Next Steps

1. **Add Google Places API Key** - Get real lead data
2. **Set up Azure Speech** - Enable text-to-speech for AI calls
3. **Configure Telnyx** - Make real phone calls
4. **Add Azure OpenAI** - Power conversational AI agents
5. **Set up PostgreSQL** - Persist data to database
6. **Deploy to Azure** - Use the free tier deployment guide

---

## 📚 Documentation

- [Architecture](./src/ARCHITECTURE.md)
- [Deployment Guide](./src/DEPLOYMENT_AZURE.md)
- [Business Models](./src/BUSINESS_MODELS.md)
- [Use Cases](./src/USE_CASES.md)

---

**🎊 Congratulations! Your CRM backend and frontend are fully integrated and ready for testing.**
