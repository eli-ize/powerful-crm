# 🚀 Azure Free Tier Quick Start Guide

**Deploy your AI CRM for FREE in 15 minutes** using Azure's generous free tier.

## 🎯 What You'll Get

- ✅ **Frontend**: Azure Static Web Apps (FREE forever)
- ✅ **Backend**: Azure Container Apps (2M requests/month FREE)
- ✅ **Database**: Azure PostgreSQL (250MB FREE)
- ✅ **Cache**: Azure Redis (250MB FREE)
- ✅ **AI Services**: Azure Speech + OpenAI (FREE tier)
- ✅ **Storage**: Azure Blob Storage (5GB FREE)
- ✅ **Monitoring**: Application Insights (5GB data/month FREE)

**Total Cost: $0-15/month** (vs $200+ elsewhere)

---

## ⚡ Super Quick Deploy (5 Minutes)

### 1. One-Click Azure Setup

```bash
# Clone and deploy in one command
git clone https://github.com/YOUR_USERNAME/powerful-crm.git
cd powerful-crm

# Run the magic deployment script
./deploy-azure-free.sh
```

### 2. Set Environment Variables

```bash
# Copy free tier template
cp .env.azure-free .env.local

# Add your API keys (optional for demo)
GOOGLE_PLACES_API_KEY=your_key_here
TELNYX_API_KEY=your_key_here
```

### 3. Access Your CRM

```
Frontend: https://your-app.azurestaticapps.net
Backend:  https://your-app.azurecontainerapps.io
Admin:    admin@crm.com / demo123
```

**Done! Your AI CRM is live on Azure FREE tier! 🎉**

---

## 📋 Manual Deployment (15 Minutes)

### Step 1: Azure Account Setup

1. **Create free Azure account**: https://azure.microsoft.com/free
2. **Install Azure CLI**: 
   ```bash
   # Windows
   winget install Microsoft.AzureCLI
   
   # macOS
   brew install azure-cli
   
   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```
3. **Login**: `az login`

### Step 2: Deploy Frontend (2 minutes)

```bash
# Fork the repo on GitHub first, then:
az staticwebapp create \
  --name ai-crm-frontend \
  --resource-group ai-crm-rg \
  --location eastus \
  --source https://github.com/YOUR_USERNAME/powerful-crm \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

### Step 3: Deploy Backend (5 minutes)

```bash
# Create Container Apps environment
az containerapp env create \
  --name ai-crm-env \
  --resource-group ai-crm-rg \
  --location eastus

# Deploy backend container
az containerapp create \
  --name ai-crm-backend \
  --resource-group ai-crm-rg \
  --environment ai-crm-env \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 5
```

### Step 4: Setup Database (3 minutes)

```bash
# Create PostgreSQL database (FREE tier)
az postgres flexible-server create \
  --name ai-crm-db \
  --resource-group ai-crm-rg \
  --location eastus \
  --admin-user dbadmin \
  --admin-password 'SecurePass123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14 \
  --public-access 0.0.0.0

# Create database
az postgres flexible-server db create \
  --resource-group ai-crm-rg \
  --server-name ai-crm-db \
  --database-name crmdb
```

### Step 5: Add AI Services (5 minutes)

```bash
# Create Speech service (FREE tier)
az cognitiveservices account create \
  --name ai-crm-speech \
  --resource-group ai-crm-rg \
  --kind SpeechServices \
  --sku F0 \
  --location eastus

# Create OpenAI service (requires approval)
az cognitiveservices account create \
  --name ai-crm-openai \
  --resource-group ai-crm-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus
```

---

## 🔧 Configuration

### Environment Variables

```env
# Azure Services (all FREE tier)
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=eastus
AZURE_OPENAI_KEY=your_openai_key
AZURE_OPENAI_ENDPOINT=https://ai-crm-openai.openai.azure.com/

# Database (FREE PostgreSQL)
DATABASE_URL=postgresql://dbadmin:SecurePass123!@ai-crm-db.postgres.database.azure.com:5432/crmdb

# External APIs (optional)
GOOGLE_PLACES_API_KEY=your_places_key
TELNYX_API_KEY=your_telnyx_key

# Application Insights (FREE)
APPINSIGHTS_INSTRUMENTATIONKEY=your_insights_key
```

### Container Apps Configuration

```yaml
# azure-container-apps.yml
properties:
  configuration:
    ingress:
      external: true
      targetPort: 3000
    scale:
      minReplicas: 0  # Scale to zero for FREE tier
      maxReplicas: 5
  template:
    containers:
    - name: backend
      image: your-registry/backend:latest
      resources:
        cpu: 0.25      # FREE tier limit
        memory: 0.5Gi  # FREE tier limit
```

---

## 📊 FREE Tier Limits

### What's Included FREE:

| Service | Free Tier Limit | Good For |
|---------|-----------------|----------|
| **Static Web Apps** | Unlimited | ∞ users |
| **Container Apps** | 2M requests/month | 67K requests/day |
| **PostgreSQL** | 250MB storage | 50K contacts |
| **Redis Cache** | 250MB cache | Fast responses |
| **Speech TTS** | 5K characters/month | 50 AI calls |
| **Speech STT** | 5 hours/month | 300 minutes |
| **Blob Storage** | 5GB storage | Call recordings |
| **App Insights** | 5GB data/month | Full monitoring |

### When You'll Need to Pay:

- **Heavy AI calling**: >5 hours/month STT (~$1/hour after)
- **Large database**: >250MB (~$0.043/GB after)
- **High traffic**: >2M requests/month (~$0.000016/request after)

**Typical costs after free tier: $5-20/month**

---

## 🔍 Monitoring & Alerts

### Set Up Cost Alerts

```bash
# Create budget alert at $10/month
az consumption budget create \
  --budget-name ai-crm-budget \
  --amount 10 \
  --time-grain Monthly \
  --category Cost \
  --notifications \
    amount=8 \
    operator=GreaterThan \
    contact-emails=your-email@example.com
```

### Monitor Usage

```bash
# Check current usage
az monitor metrics list \
  --resource ai-crm-backend \
  --resource-group ai-crm-rg \
  --metric Requests

# View costs
az consumption usage list \
  --start-date 2025-10-01 \
  --end-date 2025-10-31
```

---

## 🛠️ Troubleshooting

### Common Issues:

**❌ "Quota exceeded" errors**
```bash
# Check your free tier usage
az account show --query '{subscriptionId:id}' -o tsv | \
xargs az consumption usage list --subscription
```

**❌ Container app won't start**
```bash
# Check logs
az containerapp logs show \
  --name ai-crm-backend \
  --resource-group ai-crm-rg \
  --tail 50
```

**❌ Database connection fails**
```bash
# Add firewall rule for Container Apps
az postgres flexible-server firewall-rule create \
  --resource-group ai-crm-rg \
  --name ai-crm-db \
  --rule-name AllowContainerApps \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

### Get Help:

- 📚 **Azure Docs**: https://docs.microsoft.com/azure/container-apps/
- 💬 **Support**: Azure Portal → Help + Support
- 🐛 **Issues**: https://github.com/YOUR_USERNAME/powerful-crm/issues

---

## 🎯 Next Steps

### After Deployment:

1. **✅ Test the demo**: Login with `admin@crm.com / demo123`
2. **✅ Add your API keys**: Enable real AI calling
3. **✅ Import leads**: Use Lead Finder to get prospects
4. **✅ Create campaigns**: Set up your first AI calling campaign
5. **✅ Monitor costs**: Set up alerts and track usage

### Scale Up Options:

- **More users**: Upgrade to paid Container Apps tiers
- **Bigger database**: Switch to Standard PostgreSQL
- **Global CDN**: Add Azure Front Door
- **Advanced AI**: Add custom models and training

---

## 🎉 Success!

**Your AI CRM is now running on Azure FREE tier!**

- 🌐 **Frontend**: https://your-app.azurestaticapps.net
- 🔗 **API**: https://your-app.azurecontainerapps.io
- 📊 **Monitoring**: Azure Portal → Resource Groups → ai-crm-rg

**Cost: $0/month** until you exceed free tier limits! 🎯

Start making AI calls and automating your sales process! 🚀

---

**Questions?** Check the [full deployment guide](./DEPLOYMENT_AZURE.md) or [contact support](mailto:support@your-domain.com).
