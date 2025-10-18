# 🤖 AI Copilot Continuation Instructions

## Project Overview
**Universal AI Sales Automation Platform** - Enterprise-grade CRM with AI-powered features for selling any product/service. Features include contact management, deal pipeline, email integration, telephony (Telnyx), AI virtual agents, lead finding (Google Places API), and comprehensive analytics.

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **APIs**: Google Places, Telnyx (calls/SMS), Azure TTS/STT
- **Deployment**: Azure Container Apps + Azure Database for PostgreSQL
- **Auth**: JWT tokens with refresh mechanism

## Design System
- **Color**: Blue accent (#3B82F6), white backgrounds, subtle gray borders
- **Style**: Clean, professional (Linear/Notion aesthetic)
- **Responsive**: Mobile-first with `p-4 md:p-8`, `mb-6 md:mb-8`
- **Typography**: NO custom font size/weight classes unless user requests

## Code Standards

### Frontend (React/TypeScript)
```typescript
// ✅ CORRECT patterns
import { Component } from '../ui/component';
import { toast } from 'sonner@2.0.3';

// Component structure
export function MyComponent() {
  const [state, setState] = useState<Type>();
  
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        {/* Content with proper overflow handling */}
        <div className="min-w-0 truncate">Long text</div>
      </div>
    </div>
  );
}

// ❌ AVOID
// - Hardcoded API keys
// - localStorage for sensitive data in production
// - Custom font size classes (text-2xl, font-bold, etc.)
```

### Backend (Node.js/Express)
```typescript
// ✅ CORRECT patterns
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/auth';

// Always use environment variables
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

// Proper error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ❌ AVOID
// - Exposing API keys in responses
// - Missing error handling
// - Direct database queries without validation
```

### Database (Prisma)
```typescript
// ✅ CORRECT patterns
// Use proper relations
model User {
  id        String   @id @default(uuid())
  contacts  Contact[]
}

model Contact {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

// ❌ AVOID
// - Missing indexes on foreign keys
// - No cascade delete strategies
// - Exposing password hashes
```

## File Structure Rules

### Frontend Components
```
/components
├── /auth - Authentication only
├── /crm - All CRM features
├── /ui - shadcn components (DON'T MODIFY)
└── /figma - Protected system files (DON'T MODIFY)
```

### Backend Structure
```
/backend
├── /src
│   ├── /routes - API endpoints
│   ├── /controllers - Business logic
│   ├── /middleware - Auth, validation, etc.
│   ├── /services - External API integrations
│   ├── /models - Data models (if not using Prisma)
│   └── /utils - Helper functions
├── /prisma
│   ├── schema.prisma
│   └── /migrations
└── server.ts - Entry point
```

## API Endpoint Patterns

### Standard REST Structure
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/:id
PUT    /api/contacts/:id
DELETE /api/contacts/:id
```

### Response Format
```typescript
// ✅ Success
{
  "success": true,
  "data": { /* ... */ },
  "message": "Contact created successfully"
}

// ✅ Error
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email is required"]
}
```

## Environment Variables

**Required for Backend:**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-secret-key

# APIs
GOOGLE_PLACES_API_KEY=AIza...
TELNYX_API_KEY=KEY...
TELNYX_PUBLIC_KEY=KEY...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus

# Email (Optional - SendGrid/SMTP)
EMAIL_API_KEY=...
EMAIL_FROM=noreply@yourapp.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Required for Frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Security Checklist

**ALWAYS enforce:**
- ✅ JWT token validation on protected routes
- ✅ Password hashing with bcrypt (12 rounds minimum)
- ✅ Input validation on all endpoints (use Zod or Joi)
- ✅ Rate limiting (express-rate-limit)
- ✅ CORS configuration (only allow frontend domain)
- ✅ SQL injection prevention (use Prisma/parameterized queries)
- ✅ XSS prevention (sanitize user input)
- ✅ Environment variables for all secrets
- ✅ HTTPS in production

**NEVER do:**
- ❌ Store passwords in plain text
- ❌ Expose API keys in frontend code
- ❌ Allow SQL injection via string concatenation
- ❌ Return sensitive data in error messages
- ❌ Use weak JWT secrets

## Testing Strategy

### Backend Testing
```typescript
// Use Jest + Supertest
import request from 'supertest';
import app from '../server';

describe('POST /api/contacts', () => {
  it('should create a contact', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Doe', email: 'john@example.com' });
    
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('John Doe');
  });
});
```

### Frontend Testing (Optional)
```typescript
// Use React Testing Library
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

test('renders dashboard title', () => {
  render(<Dashboard />);
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});
```

## Docker Best Practices

### Multi-stage Builds
```dockerfile
# ✅ Optimize for production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

## Azure Deployment

### Container Apps Configuration (FREE Tier)
```yaml
# Use Azure Container Apps for cost-effective deployment
resources:
  containerApp:
    type: Microsoft.App/containerApps
    properties:
      configuration:
        ingress:
          external: true
          targetPort: 3000
        scale:
          minReplicas: 0  # Scale to zero for cost savings
          maxReplicas: 10
      template:
        containers:
        - name: backend
          image: your-registry.azurecr.io/backend:latest
          resources:
            cpu: 0.25
            memory: 0.5Gi
          env:
          - name: DATABASE_URL
            secretRef: database-url
          - name: AZURE_SPEECH_KEY
            secretRef: speech-key

# Resource allocation (FREE tier limits)
resources:
  cpu: 0.25 cores (FREE: up to 2M requests/month)
  memory: 0.5Gi (FREE: 400K GB-seconds/month)

# Scaling rules (FREE tier)
scale:
  minReplicas: 0  # Scale to zero when idle
  maxReplicas: 5  # Reasonable limit for free tier
```

## Common Issues & Solutions

### Issue: Azure free tier limits exceeded
**Solution:** Optimize resource usage and implement smart scaling
```typescript
// Scale to zero when idle
scale: {
  minReplicas: 0,
  maxReplicas: 5
}

// Implement request batching
const batchRequests = (requests) => {
  // Group multiple API calls
  // Reduce total request count
};
```

### Issue: Cold starts in Container Apps
**Solution:** Implement warming strategies
```typescript
// Keep one instance warm during business hours
scale: {
  minReplicas: process.env.NODE_ENV === 'production' ? 1 : 0
}
```

### Issue: Database connection timeout
**Solution:** Use Azure PostgreSQL connection pooling
```typescript
// Use built-in connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit for free tier
  idleTimeoutMillis: 30000
});
```

### Issue: JWT token expiration handling
**Solution:** Implement refresh token mechanism
```typescript
// Backend: Return both tokens
{ 
  accessToken: '...', // 15min expiry
  refreshToken: '...' // 7 days expiry
}

// Frontend: Auto-refresh before expiry
```

## Git Workflow

### Commit Message Format
```
feat: Add contact creation endpoint
fix: Resolve CORS issue in production
chore: Update dependencies
docs: Add API documentation
refactor: Improve error handling
```

### Branch Strategy
```
main          -> Production-ready code
develop       -> Development branch
feature/*     -> New features
fix/*         -> Bug fixes
hotfix/*      -> Critical production fixes
```

## Performance Optimization

### Backend
- ✅ Use Redis for caching frequently accessed data
- ✅ Implement database indexing on foreign keys
- ✅ Use pagination for large datasets (default: 50 items/page)
- ✅ Compress responses with gzip
- ✅ Use CDN for static assets

### Frontend
- ✅ Lazy load routes with React.lazy()
- ✅ Debounce search inputs (300ms)
- ✅ Use React Query for API caching
- ✅ Optimize images with next/image or similar

## Monitoring & Logging

### Production Logging
```typescript
// Use structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log format
logger.info('User login successful', {
  userId: user.id,
  timestamp: new Date().toISOString(),
  ip: req.ip
});
```

## Next Steps for Implementation

### Phase 1: Azure Setup (Priority 1)
1. Create Azure account and enable free services
2. Set up Azure Container Apps environment
3. Configure Azure Database for PostgreSQL (FREE)
4. Set up Azure Static Web Apps for frontend
5. Configure Azure Application Insights

### Phase 2: Backend Core (Priority 2)
6. Deploy Express server to Container Apps
7. Implement authentication with Azure AD B2C (optional)
8. Create CRUD endpoints for contacts
9. Add JWT middleware protection
10. Set up Azure Redis for caching

### Phase 3: API Integrations (Priority 3)
11. Azure Speech Services integration
12. Azure OpenAI Service integration
13. Google Places API proxy endpoint
14. Telnyx calling/SMS endpoints
15. Implement request batching for cost optimization

### Phase 4: Production Optimization (Priority 4)
16. Configure auto-scaling policies
17. Set up Azure DevOps CI/CD pipeline
18. Implement monitoring and alerting
19. Add cost optimization features
20. Performance testing and optimization

## Quick Commands Reference

```bash
# Development
npm run dev          # Start frontend dev server
npm run backend:dev  # Start backend dev server
docker-compose up    # Start all services locally

# Building
npm run build        # Build frontend
npm run backend:build # Build backend

# Database
npx prisma migrate dev    # Create migration
npx prisma migrate deploy # Apply migrations (prod)
npx prisma studio        # Database GUI

# Docker
docker build -t crm-frontend .
docker build -f Dockerfile.backend -t crm-backend .
docker-compose up -d

# Testing
npm test            # Run frontend tests
npm run backend:test # Run backend tests

# Deployment
az containerapp up  # Deploy to Azure
```

## Contact & Collaboration

**When continuing work:**
1. Read ARCHITECTURE.md for system overview
2. Check this file for coding standards
3. Review existing components before creating new ones
4. Test locally with docker-compose before deploying
5. Update API documentation when adding endpoints

**Key Files to Reference:**
- `/ARCHITECTURE.md` - System design & flow
- `/DEPLOYMENT_AZURE.md` - Deployment steps
- `/BUSINESS_MODELS.md` - Business logic
- `/USE_CASES.md` - Feature examples
- `/backend/README.md` - Backend API documentation

---

## 🎯 Current Status

**✅ COMPLETE:**
- Frontend UI (100%)
- Responsive design (100%)
- Component library (100%)
- Documentation (100%)

**🚧 IN PROGRESS:**
- Backend API (see `/backend/README.md`)
- Database schema (see `/backend/prisma/schema.prisma`)
- Docker configuration (see `/docker-compose.yml`)

**⏳ TODO:**
- Azure deployment
- Production monitoring
- Load testing
- Security audit

---

**Last Updated:** 2025-10-17
**Version:** 1.0.0
**Maintainer:** Development Team
