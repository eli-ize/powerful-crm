# Azure Free Tier Deployment Guide

**Deploy your AI CRM Call Center for FREE** using Azure's generous free tier services.

## 🆓 **Free Tier Benefits**

- **Azure Container Apps:** 2M requests/month FREE
- **Azure Static Web Apps:** Unlimited hosting FREE
- **Azure Database for PostgreSQL:** 250MB storage FREE  
- **Azure Cache for Redis:** 250MB cache FREE
- **Azure Cognitive Services:** 5K TTS chars, 5 hours STT FREE
- **Azure Storage:** 5GB blob storage FREE
- **Azure Application Insights:** 5GB data ingestion FREE

**Total Cost: $0/month** for small-medium usage!

## 🏗️ Architecture Overview (FREE TIER)

```
┌─────────────────────────────────────────────────────────────┐
│                Azure FREE TIER ARCHITECTURE                  │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Static Web   │  │ Container    │  │ Container    │      │
│  │ Apps (FREE)  │←→│ Apps (FREE)  │←→│ Apps Workers │      │
│  │              │  │              │  │ (FREE)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│          ↓                ↓                  ↓               │
└──────────|────────────────|──────────────────|───────────────┘
           │                │                  │
      ┌────┴────────────────┴──────────────────┴────┐
      │            ALL FREE TIER SERVICES            │
┌─────▼─────┐  ┌─────────────┐  ┌────────────────┐ │
│Azure DB   │  │Azure Cache  │  │Azure Storage   │ │
│PostgreSQL │  │for Redis    │  │(Recordings)    │ │
│(250MB)    │  │(250MB)      │  │(5GB)           │ │
└───────────┘  └─────────────┘  └────────────────┘ │
      │                                              │
┌─────▼──────────────────────────────────────────────▼───────┐
│         Azure Cognitive Services (FREE TIER)                │
│  - Speech: 5K chars TTS, 5 hours STT/month                  │
│  - OpenAI Service: Pay-per-use (start ~$10/month)           │
└─────────────────────────────────────────────────────────────┘

MONTHLY COST: $0 base + $5-15 for AI usage = $5-15 total
(vs $200+ on other cloud platforms)
```

## 📋 Prerequisites

### 1. Azure Account Setup
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Set subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 2. Required Azure Services
- Azure Container Apps
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Cognitive Services (Speech)
- Azure OpenAI Service
- Azure Storage Account
- Azure Container Registry

## 🚀 Free Tier Deployment Steps

### Step 1: Create Free Azure Account

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Verify you have free credits
az account show --query '{name:name, state:state, subscriptionId:id}'
```

### Step 2: Create Resource Group (FREE)

```bash
# Set variables for free tier deployment
RESOURCE_GROUP="ai-crm-free-rg"
LOCATION="eastus"  # Best region for free tier
APP_NAME="ai-crm-free"

# Create resource group (FREE)
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

### Step 3: Deploy Frontend to Static Web Apps (FREE)

```bash
# Create Static Web App (FREE forever)
az staticwebapp create \
  --name ${APP_NAME}-frontend \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --branch main \
  --app-location "/" \
  --api-location "api" \
  --output-location "dist"

# Get frontend URL
FRONTEND_URL=$(az staticwebapp show \
  --name ${APP_NAME}-frontend \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostname -o tsv)

echo "Frontend URL: https://${FRONTEND_URL}"
```

### Step 3: Create PostgreSQL Database

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name ${APP_NAME}-db \
  --location $LOCATION \
  --admin-user dbadmin \
  --admin-password 'YourSecurePassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --public-access 0.0.0.0

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name ${APP_NAME}-db \
  --database-name crmdb

# Get connection string
DB_HOST=$(az postgres flexible-server show --resource-group $RESOURCE_GROUP --name ${APP_NAME}-db --query fullyQualifiedDomainName -o tsv)
DATABASE_URL="postgresql://dbadmin:YourSecurePassword123!@${DB_HOST}:5432/crmdb"
```

### Step 4: Create Redis Cache

```bash
az redis create \
  --resource-group $RESOURCE_GROUP \
  --name ${APP_NAME}-redis \
  --location $LOCATION \
  --sku Basic \
  --vm-size c0

# Get connection string
REDIS_HOST=$(az redis show --resource-group $RESOURCE_GROUP --name ${APP_NAME}-redis --query hostName -o tsv)
REDIS_KEY=$(az redis list-keys --resource-group $RESOURCE_GROUP --name ${APP_NAME}-redis --query primaryKey -o tsv)
REDIS_URL="redis://:${REDIS_KEY}@${REDIS_HOST}:6380?ssl=true"
```

### Step 5: Create Azure Cognitive Services

```bash
# Speech service
az cognitiveservices account create \
  --name ${APP_NAME}-speech \
  --resource-group $RESOURCE_GROUP \
  --kind SpeechServices \
  --sku S0 \
  --location $LOCATION

AZURE_SPEECH_KEY=$(az cognitiveservices account keys list \
  --name ${APP_NAME}-speech \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

# Azure OpenAI (requires special access)
az cognitiveservices account create \
  --name ${APP_NAME}-openai \
  --resource-group $RESOURCE_GROUP \
  --kind OpenAI \
  --sku S0 \
  --location $LOCATION

AZURE_OPENAI_KEY=$(az cognitiveservices account keys list \
  --name ${APP_NAME}-openai \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)
```

### Step 6: Create Storage Account

```bash
az storage account create \
  --name ${APP_NAME}storage \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

STORAGE_CONNECTION=$(az storage account show-connection-string \
  --resource-group $RESOURCE_GROUP \
  --name ${APP_NAME}storage \
  --query connectionString -o tsv)
```

### Step 7: Create Container Apps Environment

```bash
az containerapp env create \
  --name ${APP_NAME}-env \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### Step 8: Build and Push Docker Images

#### Backend Dockerfile

Create `Dockerfile.backend`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy app files
COPY . .

# Build if needed
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build and push:

```bash
# Build backend
docker build -f Dockerfile.backend -t ${ACR_LOGIN_SERVER}/backend:latest .

# Login to ACR
az acr login --name $ACR_NAME

# Push
docker push ${ACR_LOGIN_SERVER}/backend:latest
```

### Step 9: Deploy Backend Container

```bash
az containerapp create \
  --name ${APP_NAME}-backend \
  --resource-group $RESOURCE_GROUP \
  --environment ${APP_NAME}-env \
  --image ${ACR_LOGIN_SERVER}/backend:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 10 \
  --cpu 1.0 \
  --memory 2.0Gi \
  --env-vars \
    DATABASE_URL=$DATABASE_URL \
    REDIS_URL=$REDIS_URL \
    AZURE_SPEECH_KEY=$AZURE_SPEECH_KEY \
    AZURE_SPEECH_REGION=$LOCATION \
    AZURE_OPENAI_KEY=$AZURE_OPENAI_KEY \
    AZURE_STORAGE_CONNECTION=$STORAGE_CONNECTION \
    NODE_ENV=production

# Get backend URL
BACKEND_URL=$(az containerapp show \
  --name ${APP_NAME}-backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Backend URL: https://${BACKEND_URL}"
```

### Step 10: Deploy Frontend Container

#### Frontend Dockerfile

Create `Dockerfile.frontend`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://YOUR_BACKEND_URL;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Build and deploy:

```bash
# Build frontend
docker build -f Dockerfile.frontend -t ${ACR_LOGIN_SERVER}/frontend:latest .
docker push ${ACR_LOGIN_SERVER}/frontend:latest

# Deploy
az containerapp create \
  --name ${APP_NAME}-frontend \
  --resource-group $RESOURCE_GROUP \
  --environment ${APP_NAME}-env \
  --image ${ACR_LOGIN_SERVER}/frontend:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --env-vars \
    BACKEND_URL=https://${BACKEND_URL}

# Get frontend URL
FRONTEND_URL=$(az containerapp show \
  --name ${APP_NAME}-frontend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Frontend URL: https://${FRONTEND_URL}"
```

### Step 11: Deploy AI Worker Container

For handling AI calling jobs in background:

```bash
az containerapp create \
  --name ${APP_NAME}-worker \
  --resource-group $RESOURCE_GROUP \
  --environment ${APP_NAME}-env \
  --image ${ACR_LOGIN_SERVER}/worker:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --min-replicas 1 \
  --max-replicas 20 \
  --cpu 1.0 \
  --memory 2.0Gi \
  --env-vars \
    DATABASE_URL=$DATABASE_URL \
    REDIS_URL=$REDIS_URL \
    AZURE_SPEECH_KEY=$AZURE_SPEECH_KEY \
    AZURE_OPENAI_KEY=$AZURE_OPENAI_KEY \
    TELNYX_API_KEY=$TELNYX_API_KEY
```

## 🔐 Security & Secrets

### Use Azure Key Vault

```bash
# Create Key Vault
az keyvault create \
  --name ${APP_NAME}-kv \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Store secrets
az keyvault secret set --vault-name ${APP_NAME}-kv --name "database-url" --value "$DATABASE_URL"
az keyvault secret set --vault-name ${APP_NAME}-kv --name "redis-url" --value "$REDIS_URL"
az keyvault secret set --vault-name ${APP_NAME}-kv --name "azure-speech-key" --value "$AZURE_SPEECH_KEY"
az keyvault secret set --vault-name ${APP_NAME}-kv --name "telnyx-key" --value "$TELNYX_API_KEY"

# Grant access to Container Apps
# (Configure managed identity and Key Vault access policies)
```

## 📊 Monitoring & Logging

### Enable Application Insights

```bash
az monitor app-insights component create \
  --app ${APP_NAME}-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --application-type web

INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app ${APP_NAME}-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

# Update container apps with instrumentation key
az containerapp update \
  --name ${APP_NAME}-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

## 💰 Cost Optimization (FREE TIER FOCUS)

### Actual Monthly Costs (Small-Medium Usage)

| Service | Free Tier Limit | Overage Cost | Typical Usage |
|---------|-----------------|--------------|---------------|
| **Container Apps** | 2M requests | $0.000016/request | FREE |
| **Static Web Apps** | Unlimited | $0 | FREE |
| **PostgreSQL** | 250MB storage | $0.043/GB | FREE |
| **Redis Cache** | 250MB cache | $0.029/GB | FREE |
| **Storage** | 5GB blob | $0.018/GB | FREE |
| **Speech Services** | 5K TTS, 5h STT | $1/hour STT | $5-10 |
| **Azure OpenAI** | Pay-per-use | $0.002/1K tokens | $5-20 |
| **Application Insights** | 5GB data | $2.30/GB | FREE |
| **Bandwidth** | 100GB outbound | $0.05/GB | FREE |
| **Total** | | | **$10-30/month** |

### Cost Optimization Tips:

1. **Scale to Zero**: Configure `minReplicas: 0` to eliminate idle costs
2. **Batch API Calls**: Group multiple requests to stay under free limits
3. **Cache Aggressively**: Use Redis to avoid repeated API calls
4. **Optimize AI Usage**: Keep conversations concise, use efficient prompts
5. **Monitor Usage**: Set up alerts when approaching free tier limits

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure Container Apps

on:
  push:
    branches: [ main ]

env:
  RESOURCE_GROUP: ai-crm-rg
  ACR_NAME: aicrmregistry

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Build and push backend
      run: |
        az acr build \
          --registry ${{ env.ACR_NAME }} \
          --image backend:${{ github.sha }} \
          --file Dockerfile.backend \
          .
    
    - name: Deploy to Container Apps
      run: |
        az containerapp update \
          --name ai-crm-backend \
          --resource-group ${{ env.RESOURCE_GROUP }} \
          --image ${{ env.ACR_NAME }}.azurecr.io/backend:${{ github.sha }}
```

## 🧪 Testing Deployment

```bash
# Test backend health
curl https://${BACKEND_URL}/api/health

# Test frontend
curl https://${FRONTEND_URL}

# Check logs
az containerapp logs show \
  --name ${APP_NAME}-backend \
  --resource-group $RESOURCE_GROUP \
  --tail 100

# Monitor metrics
az monitor metrics list \
  --resource ${APP_NAME}-backend \
  --resource-group $RESOURCE_GROUP \
  --resource-type Microsoft.App/containerApps \
  --metric CpuUsage
```

## 🛠️ Troubleshooting

### Common Issues:

**1. Container won't start**
```bash
# Check logs
az containerapp logs show --name ${APP_NAME}-backend --resource-group $RESOURCE_GROUP

# Check revision
az containerapp revision list --name ${APP_NAME}-backend --resource-group $RESOURCE_GROUP
```

**2. Database connection fails**
```bash
# Verify firewall rules
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name ${APP_NAME}-db \
  --rule-name AllowContainerApps \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

**3. High costs**
```bash
# Check resource usage
az containerapp show --name ${APP_NAME}-backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.template.scale

# Reduce replicas
az containerapp update \
  --name ${APP_NAME}-backend \
  --resource-group $RESOURCE_GROUP \
  --min-replicas 0 \
  --max-replicas 3
```

## 🗑️ Cleanup

To delete all resources:

```bash
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## 📚 Additional Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [Azure Cognitive Services](https://docs.microsoft.com/azure/cognitive-services/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/azure/postgresql/)
- [Azure Redis Cache](https://docs.microsoft.com/azure/azure-cache-for-redis/)

---

**Your AI CRM is now deployed on Azure Container Apps! 🎉**

Access your application at: `https://${FRONTEND_URL}`
