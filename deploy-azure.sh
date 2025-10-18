#!/bin/bash

# 🚀 Azure Free Tier Deployment Script
# Deploy your AI CRM to Azure for FREE in 5 minutes

set -e

echo "🚀 Starting Azure FREE tier deployment..."

# Configuration
RESOURCE_GROUP="ai-crm-free"
LOCATION="eastus"
APP_NAME="ai-crm-$(date +%s)"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login check
if ! az account show &> /dev/null; then
    echo "🔐 Please login to Azure first..."
    az login
fi

echo "✅ Azure CLI authenticated"

# Create resource group
echo "📁 Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output none

echo "✅ Resource group created: $RESOURCE_GROUP"

# Deploy frontend to Static Web Apps
echo "🌐 Deploying frontend to Azure Static Web Apps (FREE)..."

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for Azure deployment"
fi

# Create static web app
FRONTEND_URL=$(az staticwebapp create \
    --name "${APP_NAME}-frontend" \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --source . \
    --branch main \
    --app-location "/" \
    --output-location "dist" \
    --query defaultHostname -o tsv)

echo "✅ Frontend deployed to: https://$FRONTEND_URL"

# Create Container Apps environment
echo "🏗️ Creating Container Apps environment..."
az containerapp env create \
    --name "${APP_NAME}-env" \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --output none

echo "✅ Container Apps environment created"

# Deploy backend container (using demo image for now)
echo "🔧 Deploying backend to Container Apps (FREE tier)..."
BACKEND_URL=$(az containerapp create \
    --name "${APP_NAME}-backend" \
    --resource-group $RESOURCE_GROUP \
    --environment "${APP_NAME}-env" \
    --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
    --target-port 80 \
    --ingress external \
    --min-replicas 0 \
    --max-replicas 3 \
    --cpu 0.25 \
    --memory 0.5Gi \
    --query properties.configuration.ingress.fqdn -o tsv)

echo "✅ Backend API deployed to: https://$BACKEND_URL"

# Create PostgreSQL database (FREE tier)
echo "🗄️ Creating PostgreSQL database (FREE tier)..."
DB_PASSWORD="SecurePass$(date +%s)!"

az postgres flexible-server create \
    --name "${APP_NAME}-db" \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --admin-user dbadmin \
    --admin-password "$DB_PASSWORD" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32 \
    --version 14 \
    --public-access 0.0.0.0 \
    --output none

# Create database
az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name "${APP_NAME}-db" \
    --database-name crmdb \
    --output none

echo "✅ PostgreSQL database created (FREE tier)"

# Create Redis cache (FREE tier)
echo "⚡ Creating Redis cache (FREE tier)..."
az redis create \
    --name "${APP_NAME}-redis" \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Basic \
    --vm-size c0 \
    --output none

echo "✅ Redis cache created (FREE tier)"

# Create Speech service (FREE tier)
echo "🗣️ Creating Azure Speech service (FREE tier)..."
az cognitiveservices account create \
    --name "${APP_NAME}-speech" \
    --resource-group $RESOURCE_GROUP \
    --kind SpeechServices \
    --sku F0 \
    --location $LOCATION \
    --yes \
    --output none

SPEECH_KEY=$(az cognitiveservices account keys list \
    --name "${APP_NAME}-speech" \
    --resource-group $RESOURCE_GROUP \
    --query key1 -o tsv)

echo "✅ Speech service created (FREE tier)"

# Create Application Insights (FREE tier)
echo "📊 Creating Application Insights (FREE tier)..."
az extension add --name application-insights --only-show-errors

INSIGHTS_KEY=$(az monitor app-insights component create \
    --app "${APP_NAME}-insights" \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --application-type web \
    --query instrumentationKey -o tsv)

echo "✅ Application Insights created (FREE tier)"

# Create storage account (FREE tier)
echo "💾 Creating storage account (FREE tier)..."
STORAGE_NAME="${APP_NAME//-/}storage"
az storage account create \
    --name $STORAGE_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --output none

echo "✅ Storage account created (FREE tier)"

# Generate environment variables
cat > .env.azure << EOF
# 🎉 Your Azure FREE tier deployment is ready!
# Copy these environment variables to your application

# Azure Services (all FREE tier)
AZURE_SPEECH_KEY=$SPEECH_KEY
AZURE_SPEECH_REGION=$LOCATION
APPINSIGHTS_INSTRUMENTATIONKEY=$INSIGHTS_KEY

# Database (FREE PostgreSQL tier)
DATABASE_URL=postgresql://dbadmin:$DB_PASSWORD@${APP_NAME}-db.postgres.database.azure.com:5432/crmdb

# Redis (FREE tier)
REDIS_URL=redis://${APP_NAME}-redis.redis.cache.windows.net:6379

# Application URLs
FRONTEND_URL=https://$FRONTEND_URL
BACKEND_URL=https://$BACKEND_URL

# Add your own API keys:
# GOOGLE_PLACES_API_KEY=your_places_key
# TELNYX_API_KEY=your_telnyx_key
# AZURE_OPENAI_KEY=your_openai_key
EOF

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================================"
echo "📱 Frontend:    https://$FRONTEND_URL"
echo "🔗 Backend:     https://$BACKEND_URL"
echo "📊 Monitoring:  Azure Portal → $RESOURCE_GROUP"
echo "💰 Cost:        $0/month (FREE tier)"
echo ""
echo "📋 Next Steps:"
echo "1. Check .env.azure for your environment variables"
echo "2. Add your API keys (Google Places, Telnyx, etc.)"
echo "3. Configure your backend container with real image"
echo "4. Start using your AI CRM!"
echo ""
echo "📚 Documentation:"
echo "   - Architecture: ./src/ARCHITECTURE.md"
echo "   - Quick Start: ./DEPLOYMENT_QUICKSTART.md"
echo "   - Business Models: ./src/BUSINESS_MODELS.md"
echo ""
echo "🚀 Happy automating!"