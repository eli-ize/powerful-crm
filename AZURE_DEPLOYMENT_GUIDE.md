# 🚀 Azure Deployment Guide for Powerful CRM

This guide will help you deploy your Powerful CRM to Azure Container Apps with automatic CI/CD from GitHub.

## 📋 Prerequisites

1. **Azure Account** (free tier works!)
   - Sign up at: https://azure.microsoft.com/free/
   - $200 free credit for 30 days
   - Free tier includes Container Apps

2. **Azure CLI** installed
   - Download: https://aka.ms/installazurecliwindows
   - Verify: Run `az --version` in PowerShell

3. **GitHub Account**
   - Repository: https://github.com/eli-ize/powerful-crm

## 🎯 Quick Start (3 Steps)

### Step 1: Run Azure Setup Script

Open PowerShell in your project folder and run:

```powershell
.\azure-setup.ps1
```

This script will:
- ✅ Create Azure Resource Group
- ✅ Create Container Registry
- ✅ Create Container Apps Environment
- ✅ Create Container App
- ✅ Generate credentials
- ✅ Save deployment info

**Time:** ~10 minutes

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/eli-ize/powerful-crm
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these:

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `REGISTRY_USERNAME` | powerfulcrm | From azure-setup.ps1 output |
| `REGISTRY_PASSWORD` | (generated) | From azure-setup.ps1 output |
| `AZURE_CREDENTIALS` | (JSON object) | Run the command shown in script output |
| `TELNYX_API_KEY` | <your-telnyx-api-key> | Get from Telnyx portal |
| `TELNYX_CONNECTION_ID` | YOUR_CONNECTION_ID | Already configured |
| `BACKEND_URL` | https://powerful-crm.azurecontainerapps.io | From azure-setup.ps1 output |
| `JWT_SECRET` | (random string) | Generate: `[guid]::NewGuid()` |

#### Getting AZURE_CREDENTIALS:

Run this command (shown in azure-setup.ps1 output):

```powershell
az ad sp create-for-rbac --name "powerful-crm-deploy" --role contributor --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/powerful-crm-rg --sdk-auth
```

Copy the entire JSON output and paste as `AZURE_CREDENTIALS` secret.

### Step 3: Push Code to GitHub

```bash
git add .
git commit -m "Add Azure deployment configuration"
git push origin main
```

**That's it!** GitHub Actions will automatically:
1. Build your Docker container
2. Push to Azure Container Registry
3. Deploy to Azure Container Apps
4. Your app will be live in ~5 minutes!

## 🌐 Accessing Your Deployed App

After deployment completes:

- **App URL:** https://powerful-crm.azurecontainerapps.io
- **API URL:** https://powerful-crm.azurecontainerapps.io/api/health
- **Webhook URL:** https://powerful-crm.azurecontainerapps.io/api/telnyx/webhook

## 🔗 Update Telnyx Webhook

After deployment, update your Telnyx Call Control App:

```powershell
$headers = @{ 
    "Authorization" = "Bearer <your-telnyx-api-key>"
    "Content-Type" = "application/json" 
}
$body = @{ 
    webhook_event_url = "https://powerful-crm.azurecontainerapps.io/api/telnyx/webhook"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.telnyx.com/v2/call_control_applications/YOUR_CONNECTION_ID" -Method Patch -Headers $headers -Body $body
```

## 🔄 How Auto-Deployment Works

```
You → Push code to GitHub
     ↓
GitHub Actions triggers
     ↓
Builds Docker container
     ↓
Pushes to Azure Container Registry
     ↓
Deploys to Azure Container Apps
     ↓
Your app is updated! (2-3 minutes)
```

Every time you push to `main` branch, your app auto-deploys!

## 📊 Monitoring Your App

### View Logs:
```powershell
az containerapp logs show --name powerful-crm --resource-group powerful-crm-rg --follow
```

### Check Status:
```powershell
az containerapp show --name powerful-crm --resource-group powerful-crm-rg --query properties.runningStatus
```

### View Metrics:
```powershell
az monitor metrics list --resource /subscriptions/$(az account show --query id -o tsv)/resourceGroups/powerful-crm-rg/providers/Microsoft.App/containerApps/powerful-crm
```

## 🔧 Updating Environment Variables

If you need to change secrets (API keys, etc.):

```powershell
az containerapp update --name powerful-crm --resource-group powerful-crm-rg --set-env-vars TELNYX_API_KEY=new-key-here
```

## 💰 Cost Estimate

**Azure Container Apps Pricing:**
- First 180,000 vCPU-seconds: **FREE**
- First 360,000 GiB-seconds: **FREE**
- Your app (0.5 vCPU, 1GB RAM, 1 instance): **~$5-10/month**
- With free tier: **$0-5/month**

**What you get:**
- ✅ 99.95% uptime SLA
- ✅ Auto-scaling (1-3 instances)
- ✅ HTTPS included
- ✅ Health monitoring
- ✅ Auto-restart on failure

## 🛠️ Troubleshooting

### Deployment Failed?

1. **Check GitHub Actions:**
   - Go to: https://github.com/eli-ize/powerful-crm/actions
   - Click on the failed workflow
   - Check error logs

2. **Check Azure Logs:**
   ```powershell
   az containerapp logs show --name powerful-crm --resource-group powerful-crm-rg --tail 100
   ```

3. **Verify Secrets:**
   - Go to GitHub repo → Settings → Secrets
   - Make sure all secrets are added

### App Not Responding?

1. **Check Health:**
   ```powershell
   curl https://powerful-crm.azurecontainerapps.io/api/health
   ```

2. **Restart App:**
   ```powershell
   az containerapp revision restart --name powerful-crm --resource-group powerful-crm-rg
   ```

### Incoming Calls Not Working?

1. **Verify Webhook URL in Telnyx:**
   - Go to: https://portal.telnyx.com/#/app/call-control/applications/YOUR_CONNECTION_ID
   - Check webhook URL matches: `https://powerful-crm.azurecontainerapps.io/api/telnyx/webhook`

2. **Check Webhook Logs:**
   - Go to: https://webhook.site/ffd3c645-a4b1-4889-bc46-25a25f6608ed
   - Make a test call
   - See if webhook events arrive

## 🎓 Advanced: Custom Domain

Want your own domain like `crm.yourcompany.com`?

```powershell
# Add custom domain
az containerapp hostname add --hostname crm.yourcompany.com --name powerful-crm --resource-group powerful-crm-rg

# Bind SSL certificate (automatic with managed cert)
az containerapp hostname bind --hostname crm.yourcompany.com --name powerful-crm --resource-group powerful-crm-rg --environment powerful-crm-env --validation-method CNAME
```

## 📚 Resources

- **Azure Container Apps Docs:** https://learn.microsoft.com/azure/container-apps/
- **GitHub Actions Docs:** https://docs.github.com/actions
- **Telnyx Webhooks:** https://developers.telnyx.com/docs/v2/call-control/webhooks
- **Docker Best Practices:** https://docs.docker.com/develop/dev-best-practices/

## 🎉 Success Checklist

- [ ] Azure setup script completed
- [ ] GitHub secrets added
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow succeeded
- [ ] App accessible at Azure URL
- [ ] Telnyx webhook updated
- [ ] Test call successful
- [ ] Incoming calls working

---

## 💡 Pro Tips

1. **Monitor First Deploy:** Watch GitHub Actions carefully on first deploy
2. **Test Locally First:** Use `docker build` locally to test before pushing
3. **Use Staging Branch:** Create a `staging` branch for testing before `main`
4. **Enable Alerts:** Set up Azure Monitor alerts for app failures
5. **Backup Config:** Save `azure-deployment-info.txt` somewhere safe

---

**Need help?** Check the logs first, then review this guide. Most issues are secret/config related!
