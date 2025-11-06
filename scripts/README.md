# 🔧 Utility Scripts

Development and management scripts for Powerful CRM.

---

## 📜 Available Scripts

### Server Management

| Script | Purpose | Usage |
|--------|---------|-------|
| **start-servers.ps1** | Start both frontend & backend | `.\start-servers.ps1` |
| **restart-servers.ps1** | Restart all servers | `.\restart-servers.ps1` |
| **keep-servers-alive.ps1** | Monitor and restart if needed | `.\keep-servers-alive.ps1` |
| **check-servers.ps1** | Check server status | `.\check-servers.ps1` |

### Testing & Development

| Script | Purpose | Usage |
|--------|---------|-------|
| **start.ps1** | Quick start development mode | `.\start.ps1` |
| **start-testing.ps1** | Start in testing mode | `.\start-testing.ps1` |

### Legacy Scripts

| Script | Status | Alternative |
|--------|--------|-------------|
| **start-servers.bat** | Windows batch version | Use `start-servers.ps1` |
| **check-servers.bat** | Windows batch version | Use `check-servers.ps1` |

---

## 🚀 Quick Start

**Recommended for daily development:**
```powershell
# From project root
.\scripts\start-servers.ps1
```

**Or use the simplified version at root:**
```powershell
# From project root
.\start-servers.ps1  # Symlink to scripts\start-servers.ps1
```

---

## 📝 Script Details

### start-servers.ps1
Starts both frontend (port 5173) and backend (port 8000) in separate terminals.

**Features:**
- Checks for existing processes
- Validates environment setup
- Shows startup status
- Opens browser automatically (http://localhost:5173)

**Login Credentials:**
- Email: test@powerfulcrm.com
- Password: test123

### restart-servers.ps1
Gracefully stops and restarts all servers.

**Use when:**
- After code changes
- After dependency updates
- After environment variable changes
- After database schema updates

### keep-servers-alive.ps1
Background monitoring script that automatically restarts crashed servers.

**Features:**
- Monitors every 30 seconds
- Auto-restart on failure
- Logging to console
- Ctrl+C to stop

### check-servers.ps1
Quick health check for all services.

**Checks:**
- Frontend (port 5173) - React + Vite
- Backend (port 8000) - Node.js + Express
- Database connection (SQLite or PostgreSQL)
- API health endpoints

---

## 🔄 Maintenance

### Adding New Scripts
1. Add script to this folder
2. Document in this README
3. Update main README if it's essential
4. Consider adding to package.json scripts

### Script Naming Convention
- `start-*` - Server startup scripts
- `check-*` - Health check scripts
- `test-*` - Testing scripts
- `setup-*` - Setup/configuration scripts

---

**Last Updated:** January 2025  
**Developed By:** Eli Ize (ST10129307)
