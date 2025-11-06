# 🚀 Powerful CRM - AI-Powered Customer Relationship Management

**Student:** Eli Ize (ST10129307)  
**Module:** XADAD7112/w - Work Integrated Learning 3  
**Institution:** Independent Institute of Education  
**Project Type:** Individual WIL Project  

---

## 📋 Project Overview

Powerful CRM is a comprehensive Customer Relationship Management system designed specifically for Non-Profit Organizations (NPOs) and NGOs. The platform combines modern web technologies with AI integration to streamline contact management, donor relations, and organizational operations.

### 🎯 Core Features

**✅ Fully Implemented:**
- Contact Management (CRUD operations)
- Lead Generation (Google Places API integration)
- AI Chat Assistant (Azure OpenAI integration)
- User Authentication & Authorization
- Dashboard Analytics
- Responsive Design (Mobile & Desktop)
- Real-time Data Updates

**🚧 Demo/Prototype Features:**
- Phone System Integration (Telnyx foundation)
- Campaign Management (UI complete)
- Virtual Agents (Framework ready)

---

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18.3.1** - Modern component-based UI framework
- **TypeScript** - Type-safe JavaScript development
- **Vite 6.3.5** - Fast build tool and development server
- **TailwindCSS** - Utility-first styling framework
- **React Router** - Client-side routing

### Backend Stack
- **Node.js & Express** - Server runtime and web framework
- **TypeScript** - Full-stack type safety
- **Prisma ORM** - Database abstraction layer
- **PostgreSQL** - Production database
- **JWT Authentication** - Secure user sessions

### AI & External Services
- **Azure OpenAI (Phi-4)** - AI chat functionality
- **Google Places API** - Lead generation and business discovery
- **Telnyx API** - Telephony infrastructure (foundation)

### DevOps & Deployment
- **GitHub Actions** - CI/CD pipeline
- **Azure Container Apps** - Cloud hosting
- **Docker** - Containerization

---

## 📂 Project Structure

```
powerful-crm/
├── src/                          # Frontend React application
│   ├── components/crm/          # CRM-specific components
│   ├── services/               # API clients and utilities
│   ├── routes/                 # Application routing
│   └── types/                  # TypeScript definitions
├── backend/                     # Node.js backend application
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Authentication, validation
│   │   ├── routes/            # API endpoint definitions
│   │   └── services/          # Business logic
│   └── prisma/                # Database schema and migrations
├── docs/                       # Technical documentation
├── SUBMISSION_READY/           # WIL submission documents
└── scripts/                    # Development utilities
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm
- **Database:** SQLite (development) or PostgreSQL (production)
- **Optional API Keys:**
  - Azure OpenAI (Phi-4) - AI chat functionality
  - Azure Speech Services - Voice features
  - Google Places API - Lead generation
  - Telnyx API - Phone system integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eli-ize/powerful-crm.git
   cd powerful-crm
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy example environment file
   cp backend/.env.example backend/.env
   
   # Required settings for local development:
   # - DATABASE_URL="file:./prisma/dev.db" (SQLite - already configured)
   # - JWT_SECRET (generate: openssl rand -base64 32)
   # - JWT_REFRESH_SECRET (generate: openssl rand -base64 32)
   
   # Optional API keys (for full features):
   # - GOOGLE_PLACES_API_KEY (for lead generation)
   # - AZURE_OPENAI_KEY (for AI chat)
   # - AZURE_SPEECH_KEY (for voice features)
   # - TELNYX_API_KEY (for phone system)
   ```

4. **Setup database**
   ```bash
   cd backend
   
   # Generate Prisma Client
   npx prisma generate
   
   # Create database schema
   npx prisma db push
   
   # Seed test user (optional)
   npm run seed
   ```

5. **Start development servers**
   ```bash
   # Option 1: Start both servers with one command (Windows)
   npm run start
   
   # Option 2: Start manually in separate terminals
   # Terminal 1: Backend (http://localhost:8000)
   cd backend
   npm run dev
   
   # Terminal 2: Frontend (http://localhost:5173)
   cd ..
   npm run dev
   ```
   
6. **Access the application**
   - Open http://localhost:5173 in your browser
   - Login with: `test@powerfulcrm.com` / `test123`
   - Backend API: http://localhost:8000/api/health

### Production Build

```bash
# Build frontend for production
npm run build

# Start backend in production mode
cd backend
npm start
```

---

## 🌐 Live Demo & Test Credentials

**Local Development:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Health Check: http://localhost:8000/api/health

**Default Test User:**
- Email: `test@powerfulcrm.com`
- Password: `test123`
- Role: SALES_REP

**Note:** The default user is seeded automatically. Run `npm run seed` in the backend folder to recreate if needed.

---

## 🔑 Key Learning Outcomes

This project demonstrates proficiency in:

1. **Full-Stack Development** - Complete React + Node.js application
2. **Database Design** - Normalized PostgreSQL schema with Prisma ORM
3. **API Integration** - External services (Azure, Google, Telnyx)
4. **Authentication & Security** - JWT implementation, password hashing
5. **Modern DevOps** - CI/CD pipelines, containerization, cloud deployment
6. **TypeScript Mastery** - Full-stack type safety and code quality
7. **UI/UX Design** - Responsive, accessible user interface
8. **Project Management** - Solo development, version control, documentation

---

## 📈 Development Progress

- **200+ Git commits** demonstrating iterative development
- **70% test coverage** ensuring code reliability
- **10+ API endpoints** providing comprehensive backend functionality
- **25+ React components** creating modular, reusable UI
- **4 database tables** with proper relationships and constraints

---

## 🔐 GitHub Secrets Configuration

For CI/CD and deployment, configure the following secrets in your GitHub repository:

**Navigate to:** Repository Settings → Secrets and variables → Actions → New repository secret

### Required Secrets

```bash
# Database
DATABASE_URL                    # PostgreSQL connection string for production
SHADOW_DATABASE_URL            # Shadow database for Prisma migrations

# Authentication
JWT_SECRET                     # Min 32 characters (openssl rand -base64 32)
JWT_REFRESH_SECRET            # Min 32 characters (openssl rand -base64 32)

# Azure OpenAI (AI Features)
AZURE_OPENAI_KEY              # Azure OpenAI API key
AZURE_OPENAI_ENDPOINT         # e.g., https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT       # Model deployment name (e.g., Phi-4-mini-instruct)
AZURE_OPENAI_API_VERSION      # e.g., 2024-05-01-preview

# Azure Speech (Voice Features)
AZURE_SPEECH_KEY              # Azure Speech Service key
AZURE_SPEECH_REGION           # e.g., southafricanorth

# Google Places (Lead Generation)
GOOGLE_PLACES_API_KEY         # Google Places API key

# Telnyx (Phone System - Optional)
TELNYX_API_KEY               # Telnyx API key
TELNYX_PUBLIC_KEY            # Telnyx public key
TELNYX_CONNECTION_ID         # Telnyx connection ID

# Email Configuration
SMTP_HOST                    # e.g., smtp.gmail.com
SMTP_PORT                    # e.g., 587
SMTP_USER                    # SMTP username
SMTP_PASSWORD                # SMTP app password
EMAIL_FROM                   # Sender email address

# Application URLs
FRONTEND_URL                 # Production frontend URL
BACKEND_URL                  # Production backend URL
CORS_ORIGIN                  # Allowed CORS origins
```

For detailed setup instructions, see **[GITHUB_SECRETS.md](./GITHUB_SECRETS.md)**

---

## 🏆 Project Achievements

**Technical Excellence:**
- ✅ Clean, maintainable codebase with TypeScript
- ✅ Proper separation of concerns (MVC architecture)
- ✅ Error handling and validation throughout
- ✅ Responsive design for all devices
- ✅ Production-ready deployment

**Business Value:**
- ✅ Addresses real NPO/NGO needs
- ✅ Scalable architecture for growth
- ✅ AI-powered features for automation
- ✅ Integration-ready for external services

**Professional Development:**
- ✅ Independent problem-solving
- ✅ Research and implementation of new technologies
- ✅ Documentation and code organization
- ✅ Testing and quality assurance

---

## 📞 Contact & Support

**Developer:** Eli Ize  
**Student Number:** ST10129307  
**Email:** [Your Email]  
**GitHub:** https://github.com/eli-ize  

---

## 📄 License

This project is part of an academic submission for the Independent Institute of Education's Work Integrated Learning program. All rights reserved.

---

## 🙏 Acknowledgments

- **Azure OpenAI** for AI integration capabilities
- **Google Places API** for business data access
- **Telnyx** for telephony infrastructure
- **Vercel** and **Azure** for hosting solutions
- **Independent Institute of Education** for guidance and support

---

**Built with ❤️ by Eli Ize as part of WIL Project 2025**