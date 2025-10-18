# 🎯 COMPLETE GITHUB SECRETS SETUP CHECKLIST

**Project:** Powerful CRM  
**Repository:** https://github.com/eli-ize/powerful-crm  
**Date:** October 18, 2025

---

## 📍 WHERE TO ADD SECRETS

Go to: **https://github.com/eli-ize/powerful-crm/settings/secrets/actions**

Click: **"New repository secret"** for each secret below

---

## ✅ REQUIRED SECRETS (Must have for deployment)

### 🔐 Authentication & Security

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `JWT_SECRET` | JWT signing key (32+ chars) | `your-super-secret-jwt-key-minimum-32-chars` |
| `JWT_REFRESH_SECRET` | JWT refresh token key (32+ chars) | `your-super-secret-refresh-key-32-chars` |

**How to generate:**
```powershell
# PowerShell - Generate random secure strings
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})
```

---

### 🗄️ Database

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `REDIS_URL` | Redis connection string | `redis://username:password@host:6379` |

---

### ☁️ Azure Deployment

| Secret Name | Description | How to Get |
|------------|-------------|-----------|
| `AZURE_CREDENTIALS` | Azure service principal credentials | See [Azure Setup](#azure-credentials) |
| `REGISTRY_USERNAME` | Azure Container Registry username | Azure Portal → ACR → Access keys |
| `REGISTRY_PASSWORD` | Azure Container Registry password | Azure Portal → ACR → Access keys |

---

### 🌐 Application URLs

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `BACKEND_URL` | Production backend URL | `https://api.yourcrm.com` |
| `FRONTEND_URL` | Production frontend URL | `https://yourcrm.com` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://yourcrm.com` |

---

## 🔌 API SECRETS (External Services)

### 📍 Google Places (CRITICAL - You have the key!)

| Secret Name | Value | Status |
|------------|-------|--------|
| `GOOGLE_PLACES_API_KEY` | `[Your API key from Google Cloud Console]` | ⚠️ ADD NOW |

**IMPORTANT:** This key was exposed in your message. Add it immediately!

---

### 🤖 Azure AI Services (For TTS/STT & OpenAI)

| Secret Name | Description | How to Get |
|------------|-------------|-----------|
| `AZURE_SPEECH_KEY` | Azure Speech Services key | See [Azure AI Setup Guide](./AZURE_AI_SETUP_GUIDE.md) |
| `AZURE_SPEECH_REGION` | Azure region (e.g., eastus) | Azure Portal → Speech resource |
| `AZURE_OPENAI_KEY` | Azure OpenAI API key | Azure Portal → OpenAI resource |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | `https://your-resource.openai.azure.com` |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment name | `gpt-4` or `gpt-35-turbo` |
| `AZURE_OPENAI_API_VERSION` | API version | `2024-02-15-preview` |
| `OPENAI_API_KEY` | Alternative: Regular OpenAI key | https://platform.openai.com/api-keys |

---

### 📞 Telnyx (Call Automation)

| Secret Name | Description | How to Get |
|------------|-------------|-----------|
| `TELNYX_API_KEY` | Telnyx API key | https://portal.telnyx.com/#/app/api-keys |
| `TELNYX_PUBLIC_KEY` | Telnyx public key | Telnyx Portal |
| `TELNYX_CONNECTION_ID` | Telnyx connection ID | Telnyx Portal → Connections |

---

### 📧 Email (Optional but recommended)

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password/app password | `your-app-password` |
| `EMAIL_FROM` | From email address | `noreply@yourcrm.com` |

**Gmail Setup:**
```bash
1. Go to Google Account Settings
2. Security → 2-Step Verification → App passwords
3. Generate app password for "Mail"
4. Use that password in SMTP_PASSWORD
```

---

### 💳 Stripe (For subscriptions - optional)

| Secret Name | Description | How to Get |
|------------|-------------|-----------|
| `STRIPE_SECRET_KEY` | Stripe secret key | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | https://dashboard.stripe.com/webhooks |

---

## 🔧 DETAILED SETUP INSTRUCTIONS

### <a name="azure-credentials"></a>Azure Service Principal Setup

To get `AZURE_CREDENTIALS`:

```powershell
# 1. Login to Azure
az login

# 2. Get your subscription ID
az account show --query id -o tsv

# 3. Create service principal
az ad sp create-for-rbac `
  --name "powerful-crm-github" `
  --role contributor `
  --scopes /subscriptions/<YOUR_SUBSCRIPTION_ID>/resourceGroups/powerful-crm-rg `
  --sdk-auth

# 4. Copy the entire JSON output
# 5. Paste as AZURE_CREDENTIALS secret
```

The output looks like:
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  "activeDirectoryEndpointUrl": "...",
  "resourceManagerEndpointUrl": "...",
  ...
}
```

---

### Azure Container Registry

```powershell
# Get registry credentials
az acr credential show --name powerfulcrm

# Output:
# username: powerfulcrm
# passwords:
#   - name: password
#     value: <REGISTRY_PASSWORD>
```

Add to secrets:
- `REGISTRY_USERNAME`: `powerfulcrm`
- `REGISTRY_PASSWORD`: The password value

---

## 🚀 QUICK START COMMANDS

### Add Google Places Key (URGENT!)

```powershell
# 1. Go to GitHub
Start-Process "https://github.com/eli-ize/powerful-crm/settings/secrets/actions"

# 2. Click "New repository secret"
# Name: GOOGLE_PLACES_API_KEY
# Value: [Your actual Google Places API key from Google Cloud Console]

# 3. Add to local backend .env
cd "U:\Powerful CRM\backend"
@"
GOOGLE_PLACES_API_KEY=[YOUR_KEY_HERE]
"@ | Add-Content -Path .env
```

---

### Generate JWT Secrets

```powershell
# Generate two random 40-character strings
$jwt_secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})
$jwt_refresh = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})

Write-Host "JWT_SECRET: $jwt_secret"
Write-Host "JWT_REFRESH_SECRET: $jwt_refresh"

# Add to GitHub Secrets manually
# Add to local .env:
@"
JWT_SECRET=$jwt_secret
JWT_REFRESH_SECRET=$jwt_refresh
"@ | Add-Content -Path "U:\Powerful CRM\backend\.env"
```

---

## ✅ VERIFICATION CHECKLIST

After adding secrets, verify:

- [ ] **26+ secrets** added to GitHub
- [ ] Google Places API key secured
- [ ] JWT secrets generated (40+ characters each)
- [ ] Database URL configured
- [ ] Azure credentials tested
- [ ] Telnyx keys added
- [ ] Email SMTP configured (if using)
- [ ] All secrets in `.env` file match GitHub
- [ ] `.env` file NOT committed to git
- [ ] Deployment workflow runs successfully

---

## 🧪 TEST DEPLOYMENT

```powershell
# After adding all secrets:

# 1. Commit and push to trigger deployment
cd "U:\Powerful CRM"
git add .
git commit -m "feat: Add all required secrets and configurations"
git push origin master

# 2. Check GitHub Actions
Start-Process "https://github.com/eli-ize/powerful-crm/actions"

# 3. Monitor deployment logs
# Look for successful deployment message
```

---

## 📊 SECRETS PRIORITY ORDER

### Critical (Add immediately):
1. ✅ `GOOGLE_PLACES_API_KEY` - Already have it!
2. ✅ `JWT_SECRET` - Generate now
3. ✅ `JWT_REFRESH_SECRET` - Generate now
4. ✅ `DATABASE_URL` - Set up PostgreSQL
5. ✅ `TELNYX_API_KEY` - If using calls

### Important (Add for full functionality):
6. ⚠️ `AZURE_SPEECH_KEY` - For TTS/STT
7. ⚠️ `AZURE_SPEECH_REGION` - For TTS/STT
8. ⚠️ `AZURE_OPENAI_KEY` - For AI conversations
9. ⚠️ `AZURE_OPENAI_ENDPOINT` - For AI conversations
10. ⚠️ `BACKEND_URL` - For deployment
11. ⚠️ `FRONTEND_URL` - For deployment
12. ⚠️ `CORS_ORIGIN` - For deployment

### Optional (Add as needed):
13. 📧 `SMTP_*` - For email features
14. 💳 `STRIPE_*` - For payments
15. 🗄️ `REDIS_URL` - For caching
16. ☁️ Azure deployment secrets - When deploying to Azure

---

## 🔒 SECURITY BEST PRACTICES

### DO:
- ✅ Use GitHub Secrets for all sensitive data
- ✅ Generate strong random keys (40+ characters)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/prod
- ✅ Restrict API keys by IP/domain when possible
- ✅ Set up billing alerts in cloud providers

### DON'T:
- ❌ Commit secrets to git
- ❌ Share secrets in chat/email
- ❌ Use simple passwords
- ❌ Reuse secrets across projects
- ❌ Store secrets in code comments
- ❌ Screenshot secrets

---

## 🆘 TROUBLESHOOTING

### "Secret not found" error in Actions

```bash
# Check secret name spelling (case-sensitive!)
# View workflow file to see expected name
cat .github/workflows/azure-deploy.yml
```

### Deployment fails with authentication error

```bash
# Regenerate Azure credentials:
az ad sp create-for-rbac --name "powerful-crm-github-new" \
  --role contributor \
  --scopes /subscriptions/<SUB_ID>/resourceGroups/powerful-crm-rg \
  --sdk-auth
```

### API calls return 401/403

```bash
# Verify secret value in GitHub matches your API key
# Regenerate API key in provider dashboard if needed
# Update both GitHub Secret and local .env
```

---

## 📞 NEXT STEPS

1. **Add Google Places key** to GitHub Secrets (URGENT!)
2. **Generate JWT secrets** and add them
3. **Set up Azure resources** (see [AZURE_AI_SETUP_GUIDE.md](./AZURE_AI_SETUP_GUIDE.md))
4. **Add all Azure secrets**
5. **Test deployment**
6. **Monitor usage and costs**

---

**All secrets configured?** You're ready to deploy! 🚀

Need help with any step? Let me know!
