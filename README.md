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
- Node.js 18+ and npm
- PostgreSQL database
- Azure OpenAI API key (optional for AI features)
- Google Places API key (optional for lead generation)

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
   
   # Edit backend/.env with your configuration:
   # - DATABASE_URL (PostgreSQL connection)
   # - JWT_SECRET (for authentication)
   # - AZURE_OPENAI_* (for AI features)
   # - GOOGLE_PLACES_API_KEY (for lead generation)
   ```

4. **Setup database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend (http://localhost:8000)
   cd backend
   npm run dev
   
   # Terminal 2: Frontend (http://localhost:5173)
   npm run dev
   ```

### Production Build

```bash
# Build frontend for production
npm run build

# Start backend in production mode
cd backend
npm start
```

---

## 🌐 Live Demo

**Production URL:** https://powerful-crm.gentlepond-89090d4a.eastus.azurecontainerapps.io

**Test Credentials:**
- Username: `demo@powerfulcrm.com`
- Password: `demo123`

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