#!/bin/bash
echo "🚀 Starting Powerful CRM - Both Servers"
echo "========================================"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
taskkill /F /IM node.exe 2>nul || true

# Start Backend
echo "🔧 Starting Backend Server (Port 8000)..."
cd "U:\Powerful CRM\backend"
start "Backend Server" cmd /k "npm run dev"

# Wait a moment
timeout /t 3 > nul

# Start Frontend  
echo "🎨 Starting Frontend Server (Port 3000)..."
cd "U:\Powerful CRM"
start "Frontend Server" cmd /k "npm run dev"

echo ""
echo "✅ Both servers starting!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📊 Health:   http://localhost:8000/api/health"
echo ""
echo "Wait 10-15 seconds for servers to fully start..."
pause