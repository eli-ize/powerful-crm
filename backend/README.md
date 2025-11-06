# Powerful CRM Backend

Node.js + Express + TypeScript backend with Prisma ORM, Azure AI integration, and real-time features.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Copy example environment file
cp .env.example .env

# Generate secure JWT secrets
openssl rand -base64 32  # Copy to JWT_SECRET
openssl rand -base64 32  # Copy to JWT_REFRESH_SECRET

# Edit .env with your API keys (optional for full features)
```

### 3. Setup Database
```bash
# SQLite (Default - No setup needed)
# Database file: ./prisma/dev.db

# Generate Prisma Client
npx prisma generate

# Create/update database schema
npx prisma db push

# Seed test user (optional)
npm run seed
```

**Test User Created:**
- Email: `test@powerfulcrm.com`
- Password: `test123`
- Role: `SALES_REP`

### 4. Start Development Server
```bash
npm run dev
```

Server will start on **http://localhost:8000**

**Verify:** Open http://localhost:8000/api/health

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout user

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Lead Generation
- `POST /api/places/search` - Search businesses via Google Places API

### AI Chat
- `POST /api/ai-chat/start` - Start AI chat session
- `POST /api/ai-chat/message` - Send message to AI

### Voice & Speech
- `POST /api/speech/text-to-speech` - Convert text to speech (Azure)
- `POST /api/speech/speech-to-text` - Convert speech to text (Azure)

### Phone System (Telnyx)
- `POST /api/calls` - Initiate outbound call
- `POST /api/telnyx/webhook` - Telnyx webhook handler
- `GET /api/telnyx/numbers/fetch` - Fetch phone numbers

### Autopilot (AI Automation)
- `GET /api/autopilot/status` - Get autopilot status
- `GET /api/autopilot/config` - Get configuration
- `POST /api/autopilot/config` - Update configuration
- `POST /api/autopilot/start` - Start autopilot
- `POST /api/autopilot/stop` - Stop autopilot
- `GET /api/autopilot/tasks` - Get tasks
- `POST /api/autopilot/tasks/find-leads` - Find leads task
- `POST /api/autopilot/tasks/analyze-website` - Analyze website
- `POST /api/autopilot/tasks/make-calls` - Make calls
- `GET /api/autopilot/analytics` - Get analytics

### Health & Monitoring
- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database health check
- `GET /api/health/detailed` - Detailed system health

---

## ⚙️ Environment Variables

### Required (Minimum Setup)
```bash
# Database (SQLite - no setup needed)
DATABASE_URL="file:./prisma/dev.db"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_at_least_32_characters_long

# Server Configuration
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

### Optional (For Full Features)

**Google Places API (Lead Generation):**
```bash
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

**Azure OpenAI (AI Chat):**
```bash
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=Phi-4-mini-instruct
AZURE_OPENAI_API_VERSION=2024-05-01-preview
```

**Azure Speech (Voice Features):**
```bash
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=southafricanorth
```

**Telnyx (Phone System):**
```bash
TELNYX_API_KEY=your_telnyx_api_key
TELNYX_CONNECTION_ID=your_connection_id
```

**Email (SMTP):**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

See `.env.example` for complete configuration options.

---

## 🗄️ Database

**Development:** SQLite (file: `./prisma/dev.db`)  
**Production:** Azure SQL Server or PostgreSQL

### Quick Database Toggle

**Switch between SQLite and Azure SQL:**
```powershell
# Check current database
.\toggle-database.ps1 status

# Switch to SQLite (local, free, fast)
.\toggle-database.ps1 sqlite

# Switch to Azure SQL (cloud, production)
.\toggle-database.ps1 azuresql
```

**Activate paused Azure SQL Database:**
```powershell
.\activate-azure-sql.ps1
```

### Database Schema

**Core Tables:**
- `User` - User accounts and authentication
- `Contact` - Customer/lead information with duplicate prevention
- `Deal` - Sales opportunities and pipeline
- `Campaign` - Marketing campaigns
- `CampaignContact` - Campaign-contact relationships
- `CallLog` - Phone call records and transcripts
- `Activity` - User activity tracking
- `Note` - Contact/deal notes
- `Task` - Task management
- `EmailTemplate` - Email templates
- `AutopilotConfig` - AI autopilot configuration
- `AutopilotTask` - Autopilot tasks
- `AutopilotWorkflow` - Automation workflows
- `ApiUsage` - API cost tracking
- `UserConfig` - User-specific settings
- `AuditLog` - Audit trail

### Important Features
- **Unique Constraints:** `placeId` prevents duplicate contacts from Google Places
- **Indexes:** Optimized queries on `company+phone` and `company+email`
- **Relationships:** Proper foreign keys with cascade rules
- **Migrations:** Version-controlled schema changes

### Database Commands
```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema to database (dev)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (visual database editor)
npx prisma studio

# Seed test data
npm run seed
```

---

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server (tsx watch)
npm run build        # Build for production (TypeScript → JavaScript)
npm run start        # Start production server
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npx prisma studio    # Open Prisma Studio (database GUI)
npm run seed         # Seed database with test user
```

### Project Structure
```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts         # Environment variables
│   │   └── database.ts      # Prisma client setup
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── errorHandler.ts # Global error handling
│   │   ├── requestLogger.ts # HTTP request logging
│   │   ├── requestTimeout.ts # Request timeout handling
│   │   └── healthMonitor.ts # Health monitoring
│   ├── routes/              # API route definitions
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── contacts.ts      # Contact management
│   │   ├── places.ts        # Google Places integration
│   │   ├── ai-chat.ts       # AI chat endpoints
│   │   ├── speech.ts        # Azure Speech endpoints
│   │   ├── telnyx.ts        # Telnyx phone system
│   │   ├── autopilot-hybrid.ts # AI autopilot system
│   │   └── admin/           # Admin-only endpoints
│   ├── services/            # Business logic layer
│   │   ├── azureOpenAI.ts   # Azure OpenAI integration
│   │   ├── azureSpeech.ts   # Azure Speech Services
│   │   ├── googlePlaces.ts  # Google Places API
│   │   ├── telnyx.ts        # Telnyx API wrapper
│   │   ├── voiceCallHandler.ts # Voice call orchestration
│   │   ├── costTracking.ts  # API cost monitoring
│   │   └── email.ts         # Email service
│   ├── utils/               # Utility functions
│   │   └── logger.ts        # Winston logger
│   └── server.ts            # Express app entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── dev.db              # SQLite database (gitignored)
├── tests/                   # Jest test files
├── public/                  # Static files (AI chat HTML)
└── logs/                    # Application logs (gitignored)
```

### Adding New Features
1. **Create route:** Add file in `src/routes/`
2. **Add business logic:** Create service in `src/services/`
3. **Update types:** Add TypeScript types in route file
4. **Register route:** Import in `src/server.ts`
5. **Add tests:** Create test in `tests/`

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test health.test.ts

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Files:**
- `tests/health.test.ts` - Health endpoint tests
- `tests/telnyx.test.ts` - Telnyx integration tests
- `tests/setup.ts` - Test configuration

---

## 📊 Monitoring & Logging

### Winston Logging
Logs are written to:
- **Console:** All environments
- **File:** `logs/app.log` (production)
- **Error File:** `logs/error.log` (errors only)

**Log Levels:**
- `error` - System failures, unhandled errors
- `warn` - Deprecated features, high API costs
- `info` - Important events, API calls
- `debug` - Detailed debugging (development only)

### Health Monitoring
- **Basic:** `GET /api/health` - Server uptime, status
- **Database:** `GET /api/health/db` - Database connectivity
- **Detailed:** `GET /api/health/detailed` - All services + metrics

### Cost Tracking
API usage is automatically tracked in `ApiUsage` table:
- Azure OpenAI costs
- Azure Speech costs
- Telnyx call costs
- Daily/monthly spending reports

---

## 🔐 Security

### Implemented Security Features
- ✅ **JWT Authentication** - Access & refresh tokens
- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **CORS Protection** - Configurable origins
- ✅ **Helmet Security Headers** - XSS, CSP, HSTS
- ✅ **Input Validation** - express-validator
- ✅ **SQL Injection Prevention** - Prisma ORM parameterized queries
- ✅ **Error Handling** - No sensitive data in error responses
- ✅ **Request Timeouts** - Prevent hanging connections
- ✅ **Health Monitoring** - Error rate tracking

### Best Practices
1. **Environment Variables:** Never commit secrets to Git
2. **JWT Secrets:** Minimum 32 characters, use `openssl rand -base64 32`
3. **Database:** Use connection pooling in production
4. **API Keys:** Store in environment variables, not code
5. **HTTPS:** Always use HTTPS in production
6. **CORS:** Whitelist specific origins, not wildcard `*`

---

## 🚀 Production Deployment

### Deploy to Azure Container Apps

1. **Build Docker image:**
   ```bash
   docker build -t powerful-crm-backend .
   ```

2. **Push to Azure Container Registry:**
   ```bash
   az acr login --name yourregistry
   docker tag powerful-crm-backend yourregistry.azurecr.io/powerful-crm-backend
   docker push yourregistry.azurecr.io/powerful-crm-backend
   ```

3. **Deploy to Container Apps:**
   ```bash
   az containerapp create \
     --name powerful-crm-backend \
     --resource-group powerful-crm-rg \
     --image yourregistry.azurecr.io/powerful-crm-backend \
     --target-port 8000 \
     --ingress external \
     --env-vars $(cat .env.production)
   ```

### Deploy to Railway

1. Connect GitHub repository
2. Add environment variables from `.env.example`
3. Deploy automatically on push to master

### Environment Variables for Production
See `GITHUB_SECRETS.md` for complete list of required secrets.

---

## 🆘 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Database connection failed"
- Check `DATABASE_URL` format
- Ensure database server is running
- Verify credentials are correct

### "JWT token invalid"
- Ensure `JWT_SECRET` is set and minimum 32 characters
- Same secret must be used for signing and verification

### "Port 8000 already in use"
```bash
# Find process using port (PowerShell)
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F

# Or change PORT in .env
```

### "Azure OpenAI authentication failed"
- Verify `AZURE_OPENAI_KEY` is correct
- Check `AZURE_OPENAI_ENDPOINT` ends with trailing slash
- Ensure `AZURE_OPENAI_DEPLOYMENT` name matches Azure deployment

---

## 📚 Additional Documentation

- **[Main README](../README.md)** - Project overview
- **[GITHUB_SECRETS.md](../GITHUB_SECRETS.md)** - GitHub secrets configuration
- **[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)** - System architecture
- **[docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)** - Development guide
- **[docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)** - Deployment guide

---

**Developed by:** Eli Ize (ST10129307)  
**Last Updated:** January 2025
