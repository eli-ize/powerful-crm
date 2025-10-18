# 🚀 Quick Deploy to Azure - Powerful CRM

## One-Command Deployment

```powershell
# Step 1: Run the Azure setup
.\azure-setup.ps1

# Step 2: Follow the prompts and save the credentials

# Step 3: Push to GitHub
git add .
git commit -m "Deploy to Azure"
git push origin main
```

That's it! Your app will be live in ~10 minutes! 🎉

## What Gets Deployed?

✅ **Full-Stack Application:**
- Frontend (React + Vite)
- Backend (Node.js + Express)
- Telnyx Webhooks
- Real-time WebSocket support

✅ **Automatic Features:**
- HTTPS enabled
- Auto-scaling (1-3 instances)
- Health monitoring
- Auto-restart on failure
- Zero-downtime deployments

✅ **CI/CD Pipeline:**
- Push code → Auto-deploy in 2-3 minutes
- Build and deploy on every push to `main`
- Automatic rollback on failure

## 📝 Detailed Steps

### 1. Azure Setup (10 minutes)

Open PowerShell and run:

```powershell
.\azure-setup.ps1
```

**What it creates:**
- Resource Group: `powerful-crm-rg`
- Container Registry: `powerfulcrm.azurecr.io`
- Container App: `powerful-crm`
- App URL: `https://powerful-crm.azurecontainerapps.io`

**Save these from the output:**
- Registry Username
- Registry Password  
- Application URL

### 2. Configure GitHub Secrets (5 minutes)

Go to: https://github.com/eli-ize/powerful-crm/settings/secrets/actions

Add these secrets:

```
REGISTRY_USERNAME = powerfulcrm
REGISTRY_PASSWORD = (from azure-setup.ps1 output)
AZURE_CREDENTIALS = (run command shown in output)
TELNYX_API_KEY = <your-telnyx-api-key-here>
TELNYX_CONNECTION_ID = YOUR_CONNECTION_ID
BACKEND_URL = https://powerful-crm.azurecontainerapps.io
JWT_SECRET = (generate with: [guid]::NewGuid())
```

**To get AZURE_CREDENTIALS:**

Run this command (shown in azure-setup.ps1 output):

```powershell
az ad sp create-for-rbac --name "powerful-crm-deploy" --role contributor --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/powerful-crm-rg --sdk-auth
```

Copy the entire JSON output.

### 3. Deploy (2 minutes)

```bash
git add .
git commit -m "Initial Azure deployment"
git push origin main
```

Watch the deployment at: https://github.com/eli-ize/powerful-crm/actions

### 4. Update Telnyx Webhook (1 minute)

After deployment completes, update your Telnyx webhook:

```powershell
$headers = @{ 
    "Authorization" = "Bearer <your-telnyx-api-key>"
    "Content-Type" = "application/json" 
}
$body = @{ 
    webhook_event_url = "https://powerful-crm.azurecontainerapps.io/api/telnyx/webhook"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.telnyx.com/v2/call_control_applications/YOUR_CONNECTION_ID" -Method Patch -Headers $headers -Body $body

Write-Host "✅ Webhook updated!" -ForegroundColor Green
```

### 5. Test Your Deployment

```powershell
# Test health endpoint
curl https://powerful-crm.azurecontainerapps.io/api/health

# Open in browser
start https://powerful-crm.azurecontainerapps.io

# Test incoming call
# Call +16282210321 or +15129007574
```

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Container App                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Frontend (React) - Port 3000 → Static Files      │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Backend (Node.js) - Port 8000                     │ │
│  │  ├── /api/* - REST API                             │ │
│  │  ├── /api/telnyx/webhook - Incoming calls          │ │
│  │  └── Socket.IO - Real-time updates                 │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
         ┌──────────────────────────────────┐
         │  Telnyx API (Call Control)       │
         │  - Outgoing calls                │
         │  - Incoming calls                │
         │  - Webhooks                      │
         └──────────────────────────────────┘
```

## 🔄 How Auto-Deploy Works

```
1. You push code to GitHub
        ↓
2. GitHub Actions detects push to main
        ↓
3. Workflow builds Docker image
        ↓
4. Image pushed to Azure Container Registry
        ↓
5. Azure Container App pulls new image
        ↓
6. Zero-downtime rolling update
        ↓
7. Old container stops, new one serves traffic
        ↓
8. ✅ Deployment complete (2-3 minutes)
```

## 📊 Monitoring

### View Logs:
```powershell
az containerapp logs show --name powerful-crm --resource-group powerful-crm-rg --follow
```

### Check App Status:
```powershell
az containerapp show --name powerful-crm --resource-group powerful-crm-rg
```

### View Deployments:
Go to: https://github.com/eli-ize/powerful-crm/actions

## 🛠️ Troubleshooting

### Deployment Failed?

1. **Check GitHub Actions logs:**
   - https://github.com/eli-ize/powerful-crm/actions
   - Click failed workflow
   - Check error details

2. **Common issues:**
   - Missing GitHub secrets → Add all required secrets
   - Azure credentials wrong → Regenerate AZURE_CREDENTIALS
   - Registry password expired → Run azure-setup.ps1 again

### App Not Starting?

```powershell
# Check logs
az containerapp logs show --name powerful-crm --resource-group powerful-crm-rg --tail 100

# Restart app
az containerapp revision restart --name powerful-crm --resource-group powerful-crm-rg
```

### Incoming Calls Not Working?

1. **Verify webhook URL:**
   ```powershell
   # Check current webhook
   $headers = @{ "Authorization" = "Bearer <your-telnyx-api-key>" }
   Invoke-RestMethod -Uri "https://api.telnyx.com/v2/call_control_applications/YOUR_CONNECTION_ID" -Headers $headers | Select -ExpandProperty data | Select webhook_event_url
   ```

2. **Test webhook endpoint:**
   ```powershell
   curl https://powerful-crm.azurecontainerapps.io/api/telnyx/webhook
   ```

3. **Check webhook events:**
   - Make a test call
   - Check Azure logs for webhook events

## 💰 Cost

**Monthly Estimate:**
- Container App: $5-10/month
- Container Registry: $5/month (Basic tier)
- Bandwidth: $1-2/month
- **Total: ~$11-17/month**

**Free tier covers:**
- First 180,000 vCPU-seconds/month
- First 360,000 GiB-seconds/month
- If within limits: **$0/month!**

## 🚀 Performance

**Your deployment includes:**
- ✅ Auto-scaling: 1-3 instances based on load
- ✅ Health checks: Auto-restart if unhealthy
- ✅ Load balancing: Automatic traffic distribution
- ✅ HTTPS: TLS 1.2+ encryption
- ✅ CDN-ready: Can add Azure CDN for global distribution

**Expected performance:**
- Response time: 50-200ms
- Concurrent users: 100+
- Uptime: 99.95% SLA

## 📚 Next Steps

After successful deployment:

1. ✅ **Test all features:**
   - Make test calls
   - Receive test calls
   - Test CRM features

2. ✅ **Set up monitoring:**
   - Azure Application Insights
   - Alerting rules
   - Log analytics

3. ✅ **Add custom domain (optional):**
   ```powershell
   az containerapp hostname add --hostname crm.yourcompany.com --name powerful-crm --resource-group powerful-crm-rg
   ```

4. ✅ **Configure backups:**
   - Database backups
   - Configuration backups

5. ✅ **Set up staging environment:**
   - Create staging branch
   - Separate container app for testing

## 🎓 Learn More

- **Azure Container Apps:** https://learn.microsoft.com/azure/container-apps/
- **GitHub Actions:** https://docs.github.com/actions
- **Docker:** https://docs.docker.com/
- **Telnyx:** https://developers.telnyx.com/

## 🆘 Support

Having issues? Check:
1. **Azure Logs:** `az containerapp logs show`
2. **GitHub Actions:** Check workflow runs
3. **This README:** Re-read troubleshooting section

---

**Made with ❤️ for Powerful CRM**
