# Powerful CRM Backend

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Database
```bash
# Start PostgreSQL (Docker)
docker run -d \
  --name postgres-crm \
  -e POSTGRES_USER=crmuser \
  -e POSTGRES_PASSWORD=crmpass \
  -e POSTGRES_DB=powerfulcrm \
  -p 5432:5432 \
  postgres:15

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Server will start on http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/:id` - Get contact by ID
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Deals
- `GET /api/deals` - Get all deals
- `POST /api/deals` - Create deal
- `GET /api/deals/:id` - Get deal by ID
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign by ID
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Virtual Agents
- `GET /api/virtual-agents` - Get all virtual agents
- `POST /api/virtual-agents` - Create virtual agent
- `GET /api/virtual-agents/:id` - Get virtual agent by ID
- `PUT /api/virtual-agents/:id` - Update virtual agent
- `DELETE /api/virtual-agents/:id` - Delete virtual agent

### Calls
- `GET /api/calls` - Get call logs
- `POST /api/calls` - Initiate call
- `GET /api/calls/:id` - Get call details
- `POST /api/calls/:id/webhook` - Telnyx webhook

### Places (Google Places API)
- `POST /api/places/search` - Search for businesses

### Health
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check

## Environment Variables

See `.env.example` for all available configuration options.

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (32+ characters)
- `JWT_REFRESH_SECRET` - JWT refresh token secret

### Optional (for full functionality)
- `GOOGLE_PLACES_API_KEY` - For lead finding
- `TELNYX_API_KEY` - For calling/SMS
- `AZURE_SPEECH_KEY` - For AI calling
- `OPENAI_API_KEY` - For AI conversations

## Database

The application uses PostgreSQL with Prisma ORM.

### Key Tables
- `users` - User accounts and permissions
- `contacts` - Customer/lead information
- `deals` - Sales opportunities
- `campaigns` - Marketing/calling campaigns
- `virtual_agents` - AI agent configurations
- `call_logs` - Call records and transcripts
- `activities` - All user activities

### Migrations
```bash
# Create new migration
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy
```

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run db:studio` - Open Prisma Studio

### File Structure
```
src/
├── config/         # Configuration and database
├── controllers/    # Route handlers
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── server.ts       # Entry point
```

## Production Deployment

### Railway (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.ts

# Watch mode
npm test -- --watch
```

## Monitoring

The application includes:
- Winston logging
- Request/response logging
- Error tracking
- Health checks
- Metrics collection

## Security

- JWT authentication
- Role-based permissions
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
