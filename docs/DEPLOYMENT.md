# Deployment Guide

**Complete guide for deploying Powerful CRM to Azure production environment**

---

## 🚀 Deployment Overview

```
GitHub Push → GitHub Actions → Azure Container Registry → Azure Container Apps → Live
```

**Deployment Time:** ~8-10 minutes  
**Zero Downtime:** Yes (rolling updates)  
**Automatic Scaling:** Yes (1-10 replicas)  

---

## 📋 Prerequisites

### Required Azure Resources

| Resource | Purpose | Estimated Cost/Month |
|----------|---------|----------------------|
| Azure Container Apps | Host application | $30-150 |
| Azure PostgreSQL Flexible | Database | $50-200 |
| Azure Container Registry | Store images | $5-20 |
| Azure OpenAI | AI service | Pay-per-use |
| Azure Speech Services | Voice | Pay-per-use |
| Azure Application Insights | Monitoring | $5-20 |

**Total Estimated:** $90-390/month (varies with usage)

---

### Required Accounts

1. **Azure Account** ([azure.com](https://azure.com))
   - Active subscription
   - Owner or Contributor role

2. **GitHub Account** (for CI/CD)
   - Repository with code
   - Access to Actions

3. **Telnyx Account** (for telephony)
   - API key
   - Phone number purchased

---

## 🏗️ Initial Setup

### 1. Create Azure Resources

```powershell
# Login to Azure
az login

# Set variables
$RESOURCE_GROUP="powerfulcrm-rg"
$LOCATION="southafricanorth"
$APP_NAME="powerfulcrm"
$DB_NAME="powerfulcrm-db"
$REGISTRY_NAME="powerfulcrmacr"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Container Registry
az acr create `
  --resource-group $RESOURCE_GROUP `
  --name $REGISTRY_NAME `
  --sku Standard `
  --admin-enabled true

# Create PostgreSQL Flexible Server
az postgres flexible-server create `
  --resource-group $RESOURCE_GROUP `
  --name $DB_NAME `
  --location $LOCATION `
  --admin-user powerfuladmin `
  --admin-password "YourSecurePassword123!" `
  --sku-name Standard_B2s `
  --tier Burstable `
  --storage-size 32 `
  --version 14

# Create database
az postgres flexible-server db create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_NAME `
  --database-name powerfulcrm_prod

# Create Container Apps environment
az containerapp env create `
  --name powerfulcrm-env `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION

# Create Application Insights
az monitor app-insights component create `
  --app powerfulcrm-insights `
  --location $LOCATION `
  --resource-group $RESOURCE_GROUP
```

---

### 2. Configure Database

```powershell
# Allow Azure services to access database
az postgres flexible-server firewall-rule create `
  --resource-group $RESOURCE_GROUP `
  --name $DB_NAME `
  --rule-name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0

# Get connection string
$DB_HOST = az postgres flexible-server show `
  --resource-group $RESOURCE_GROUP `
  --name $DB_NAME `
  --query "fullyQualifiedDomainName" -o tsv

Write-Host "Database URL: postgresql://powerfuladmin:YourSecurePassword123!@$DB_HOST:5432/powerfulcrm_prod?sslmode=require"
```

---

### 3. Set Up Azure Key Vault (Recommended)

```powershell
# Create Key Vault
az keyvault create `
  --name powerfulcrm-kv `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION

# Store secrets
az keyvault secret set --vault-name powerfulcrm-kv --name "DATABASE-URL" --value "postgresql://..."
az keyvault secret set --vault-name powerfulcrm-kv --name "AZURE-OPENAI-KEY" --value "your-key"
az keyvault secret set --vault-name powerfulcrm-kv --name "AZURE-SPEECH-KEY" --value "your-key"
az keyvault secret set --vault-name powerfulcrm-kv --name "TELNYX-API-KEY" --value "your-key"
az keyvault secret set --vault-name powerfulcrm-kv --name "JWT-SECRET" --value "random-32-char-string"
```

---

## 🐳 Container Configuration

### Dockerfile (Backend)

**Location:** `backend/Dockerfile`

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 8000

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

---

### Dockerfile (Frontend)

**Location:** `Dockerfile.frontend`

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production server (nginx)
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## ⚙️ GitHub Actions CI/CD

### Workflow Configuration

**Location:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  REGISTRY: powerfulcrmacr.azurecr.io
  IMAGE_NAME_BACKEND: powerfulcrm-backend
  IMAGE_NAME_FRONTEND: powerfulcrm-frontend

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Login to Azure Container Registry
        run: |
          az acr login --name powerfulcrmacr
      
      - name: Build and push backend image
        run: |
          cd backend
          docker build -t $REGISTRY/$IMAGE_NAME_BACKEND:${{ github.sha }} .
          docker push $REGISTRY/$IMAGE_NAME_BACKEND:${{ github.sha }}
      
      - name: Build and push frontend image
        run: |
          docker build -f Dockerfile.frontend -t $REGISTRY/$IMAGE_NAME_FRONTEND:${{ github.sha }} .
          docker push $REGISTRY/$IMAGE_NAME_FRONTEND:${{ github.sha }}
      
      - name: Deploy to Azure Container Apps
        run: |
          az containerapp update \
            --name powerfulcrm-backend \
            --resource-group powerfulcrm-rg \
            --image $REGISTRY/$IMAGE_NAME_BACKEND:${{ github.sha }}
          
          az containerapp update \
            --name powerfulcrm-frontend \
            --resource-group powerfulcrm-rg \
            --image $REGISTRY/$IMAGE_NAME_FRONTEND:${{ github.sha }}
      
      - name: Run database migrations
        run: |
          az containerapp exec \
            --name powerfulcrm-backend \
            --resource-group powerfulcrm-rg \
            --command "npx prisma migrate deploy"
```

---

### GitHub Secrets Setup

**Required Secrets:**

```bash
# Generate Azure credentials
az ad sp create-for-rbac \
  --name "powerfulcrm-deploy" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/powerfulcrm-rg \
  --sdk-auth

# Copy output and add as AZURE_CREDENTIALS secret in GitHub
```

**Add these secrets in GitHub:**
- `AZURE_CREDENTIALS` - Output from above command
- `DATABASE_URL` - PostgreSQL connection string
- `AZURE_OPENAI_API_KEY`
- `AZURE_SPEECH_KEY`
- `TELNYX_API_KEY`
- `JWT_SECRET`

---

## 🚢 Deploy Backend Container App

```powershell
# Get ACR credentials
$ACR_USERNAME = az acr credential show `
  --name powerfulcrmacr `
  --query "username" -o tsv

$ACR_PASSWORD = az acr credential show `
  --name powerfulcrmacr `
  --query "passwords[0].value" -o tsv

# Create backend container app
az containerapp create `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --environment powerfulcrm-env `
  --image powerfulcrmacr.azurecr.io/powerfulcrm-backend:latest `
  --target-port 8000 `
  --ingress external `
  --registry-server powerfulcrmacr.azurecr.io `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --cpu 1.0 `
  --memory 2.0Gi `
  --min-replicas 1 `
  --max-replicas 10 `
  --secrets "database-url=$DATABASE_URL" `
            "azure-openai-key=$AZURE_OPENAI_KEY" `
            "azure-speech-key=$AZURE_SPEECH_KEY" `
            "telnyx-api-key=$TELNYX_API_KEY" `
  --env-vars "NODE_ENV=production" `
             "PORT=8000" `
             "DATABASE_URL=secretref:database-url" `
             "AZURE_OPENAI_API_KEY=secretref:azure-openai-key" `
             "AZURE_SPEECH_KEY=secretref:azure-speech-key" `
             "TELNYX_API_KEY=secretref:telnyx-api-key"

# Get backend URL
$BACKEND_URL = az containerapp show `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --query "properties.configuration.ingress.fqdn" -o tsv

Write-Host "Backend URL: https://$BACKEND_URL"
```

---

## 🌐 Deploy Frontend Container App

```powershell
# Create frontend container app
az containerapp create `
  --name powerfulcrm-frontend `
  --resource-group $RESOURCE_GROUP `
  --environment powerfulcrm-env `
  --image powerfulcrmacr.azurecr.io/powerfulcrm-frontend:latest `
  --target-port 80 `
  --ingress external `
  --registry-server powerfulcrmacr.azurecr.io `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --cpu 0.5 `
  --memory 1.0Gi `
  --min-replicas 1 `
  --max-replicas 5 `
  --env-vars "VITE_API_URL=https://$BACKEND_URL"

# Get frontend URL
$FRONTEND_URL = az containerapp show `
  --name powerfulcrm-frontend `
  --resource-group $RESOURCE_GROUP `
  --query "properties.configuration.ingress.fqdn" -o tsv

Write-Host "Frontend URL: https://$FRONTEND_URL"
Write-Host "Application deployed successfully!"
```

---

## 🔧 Post-Deployment Configuration

### 1. Run Database Migrations

```powershell
# Execute migrations in container
az containerapp exec `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --command "npx prisma migrate deploy"
```

---

### 2. Configure Telnyx Webhook

```powershell
# Update Telnyx webhook URL to production backend
node update-telnyx-webhook.js "https://$BACKEND_URL/api/telnyx/webhook"

# Or manually in Telnyx portal:
# 1. Go to portal.telnyx.com
# 2. Navigate to Voice > Connections
# 3. Select your connection
# 4. Update webhook URL to: https://your-backend.azurecontainerapps.io/api/telnyx/webhook
```

---

### 3. Configure Custom Domain (Optional)

```powershell
# Add custom domain
az containerapp hostname add `
  --hostname api.yourcompany.com `
  --resource-group $RESOURCE_GROUP `
  --name powerfulcrm-backend

az containerapp hostname add `
  --hostname app.yourcompany.com `
  --resource-group $RESOURCE_GROUP `
  --name powerfulcrm-frontend

# Configure DNS records:
# CNAME api.yourcompany.com → powerfulcrm-backend.<environment>.azurecontainerapps.io
# CNAME app.yourcompany.com → powerfulcrm-frontend.<environment>.azurecontainerapps.io
```

---

### 4. Enable HTTPS (Automatic)

Azure Container Apps automatically provisions free SSL certificates via Let's Encrypt. No configuration needed!

---

## 📊 Monitoring Setup

### Application Insights

```powershell
# Get instrumentation key
$INSIGHTS_KEY = az monitor app-insights component show `
  --app powerfulcrm-insights `
  --resource-group $RESOURCE_GROUP `
  --query "instrumentationKey" -o tsv

# Update container app with insights
az containerapp update `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --set-env-vars "APPLICATIONINSIGHTS_CONNECTION_STRING=$INSIGHTS_KEY"
```

**Monitor in Azure Portal:**
- Go to Application Insights → powerfulcrm-insights
- View: Live Metrics, Failures, Performance, Logs

---

### Log Analytics

```powershell
# View logs
az containerapp logs show `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --follow

# Query logs
az monitor log-analytics query `
  --workspace powerfulcrm-workspace `
  --analytics-query "ContainerAppConsoleLogs_CL | where TimeGenerated > ago(1h)"
```

---

## 🔄 Update and Rollback

### Deploy Update

```bash
# Push to main branch
git push origin main

# GitHub Actions automatically:
# 1. Builds new image
# 2. Pushes to ACR
# 3. Updates Container Apps
# 4. Runs migrations
# 5. Performs rolling update (zero downtime)
```

---

### Manual Deployment

```powershell
# Build and push images
cd backend
docker build -t powerfulcrmacr.azurecr.io/powerfulcrm-backend:v1.2.0 .
docker push powerfulcrmacr.azurecr.io/powerfulcrm-backend:v1.2.0

# Update container app
az containerapp update `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --image powerfulcrmacr.azurecr.io/powerfulcrm-backend:v1.2.0
```

---

### Rollback to Previous Version

```powershell
# List revisions
az containerapp revision list `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --query "[].{Name:name, Active:properties.active, Created:properties.createdTime}"

# Activate previous revision
az containerapp revision activate `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --revision powerfulcrm-backend--<revision-suffix>
```

---

## 🔒 Security Checklist

- [ ] All secrets stored in Azure Key Vault (not in code)
- [ ] Database requires SSL connection
- [ ] API endpoints require authentication
- [ ] CORS configured to allow only your domain
- [ ] Container Apps firewall rules configured
- [ ] Application Insights enabled for monitoring
- [ ] Database backups enabled (automatic with Azure PostgreSQL)
- [ ] Container images scanned for vulnerabilities
- [ ] Environment variables not exposed in logs
- [ ] Rate limiting enabled on API endpoints

---

## 💰 Cost Optimization

### Right-Size Resources

```powershell
# Scale down during low usage
az containerapp update `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --min-replicas 1 `
  --max-replicas 3 `
  --cpu 0.5 `
  --memory 1.0Gi

# Use Burstable tier for database
az postgres flexible-server update `
  --resource-group $RESOURCE_GROUP `
  --name $DB_NAME `
  --tier Burstable `
  --sku-name Standard_B1ms
```

---

### Use Azure Reservations

- Reserve Container Apps capacity → 30% discount
- Reserve PostgreSQL compute → 38% discount
- Reserve bandwidth → 15% discount

---

## 🆘 Troubleshooting

### Container Won't Start

```powershell
# Check logs
az containerapp logs show `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --tail 100

# Check container status
az containerapp show `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --query "properties.runningStatus"
```

---

### Database Connection Issues

```powershell
# Test connection from container
az containerapp exec `
  --name powerfulcrm-backend `
  --resource-group $RESOURCE_GROUP `
  --command "npx prisma db pull"

# Check firewall rules
az postgres flexible-server firewall-rule list `
  --resource-group $RESOURCE_GROUP `
  --name $DB_NAME
```

---

### High Costs

```powershell
# Check resource usage
az monitor metrics list `
  --resource /subscriptions/{id}/resourceGroups/$RESOURCE_GROUP `
  --metric-names "CPU" "Memory"

# Review cost analysis in Azure Portal:
# Cost Management → Cost Analysis
```

---

## 📚 Related Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Local development setup
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[SECURITY.md](SECURITY.md)** - Security best practices
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues

---

**Last Updated:** 2025  
**Maintained By:** Powerful CRM Development Team
