# Multi-stage Dockerfile for Powerful CRM
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY index.html ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY src ./src
COPY public ./public

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install backend dependencies
RUN npm ci

# Copy backend source
COPY backend/src ./src

# Build backend
RUN npm run build

# Stage 3: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy built backend from build stage
COPY --from=backend-build /app/backend/dist ./dist

# Copy built frontend from build stage
COPY --from=frontend-build /app/frontend/dist ./public

# Create a simple server to serve both frontend and backend
RUN npm install express

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]
