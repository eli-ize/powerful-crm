# 🔐 ADD GITHUB SECRETS - STEP BY STEP GUIDE

**Date:** October 18, 2025  
**Repository:** https://github.com/eli-ize/powerful-crm

---

## 🌐 GITHUB SECRETS PAGE IS NOW OPEN

The browser should have opened to:
**https://github.com/eli-ize/powerful-crm/settings/secrets/actions**

If not, click this link or copy it to your browser.

---

## 📝 HOW TO ADD SECRETS

### For Each Secret:

1. **Click** the green **"New repository secret"** button
2. **Enter** the secret name (exact spelling matters!)
3. **Paste** the secret value
4. **Click** "Add secret"
5. **Repeat** for all secrets below

---

## 🔴 CRITICAL SECRETS (Add First!)

### 1. Google Places API Key (YOU HAVE THIS!)

```
Name: GOOGLE_PLACES_API_KEY
Value: [Your Google Places API key - Get from https://console.cloud.google.com/apis/credentials]
```

**⚠️ IMPORTANT:** After adding this, also restrict it in Google Cloud Console:
- Go to: https://console.cloud.google.com/apis/credentials
- Click on your API key
- Set API restrictions: Select only "Places API"
- Set application restrictions: Add your domain or IP

---

### 2. JWT Secret (Generate Now)

Open PowerShell and run:

```powershell
# Generate JWT Secret (40 characters)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})
```

Copy the output and add to GitHub:

```
Name: JWT_SECRET
Value: [paste the generated string]
```

---

### 3. JWT Refresh Secret (Generate Now)

Run the same command again (generate a DIFFERENT one):

```powershell
# Generate JWT Refresh Secret (40 characters)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})
```

```
Name: JWT_REFRESH_SECRET
Value: [paste the new generated string]
```

---

### 4. Database URL

If you have a PostgreSQL database:

```
Name: DATABASE_URL
Value: postgresql://username:password@host:5432/database_name
```

Example for local development:
```
postgresql://postgres:yourpassword@localhost:5432/powerfulcrm
```

Example for cloud (Supabase, Railway, etc):
```
postgresql://user:pass@db.example.com:5432/powerfulcrm
```

---

### 5. Backend URL

Your production backend URL:

```
Name: BACKEND_URL
Value: https://api.yourcrm.com
```

For Azure: `https://powerful-crm.azurecontainerapps.io`

---

### 6. Frontend URL

Your production frontend URL:

```
Name: FRONTEND_URL
Value: https://yourcrm.com
```

---

### 7. CORS Origin

Same as frontend URL:

```
Name: CORS_ORIGIN
Value: https://yourcrm.com
```

---

## 🟡 TELNYX SECRETS (If You Have Them)

### 8. Telnyx API Key

Get from: https://portal.telnyx.com/#/app/api-keys

```
Name: TELNYX_API_KEY
Value: [your Telnyx API key starting with KEY...]
```

### 9. Telnyx Public Key

```
Name: TELNYX_PUBLIC_KEY
Value: [your Telnyx public key]
```

### 10. Telnyx Connection ID

```
Name: TELNYX_CONNECTION_ID
Value: [your connection ID]
```

---

## 🤖 AZURE AI SECRETS (Follow Azure Setup Guide)

### 11-12. Azure Speech Services

After creating Azure Speech resource (see AZURE_AI_SETUP_GUIDE.md):

```
Name: AZURE_SPEECH_KEY
Value: [your Azure Speech key from portal]

Name: AZURE_SPEECH_REGION
Value: eastus
```

### 13-16. Azure OpenAI

After creating Azure OpenAI resource:

```
Name: AZURE_OPENAI_KEY
Value: [your Azure OpenAI key]

Name: AZURE_OPENAI_ENDPOINT
Value: https://your-resource.openai.azure.com

Name: AZURE_OPENAI_DEPLOYMENT
Value: gpt-4

Name: AZURE_OPENAI_API_VERSION
Value: 2024-02-15-preview
```

---

## 🟢 OPTIONAL SECRETS (Add If Needed)

### Email (SMTP)

```
Name: SMTP_HOST
Value: smtp.gmail.com

Name: SMTP_PORT
Value: 587

Name: SMTP_USER
Value: your-email@gmail.com

Name: SMTP_PASSWORD
Value: your-app-password

Name: EMAIL_FROM
Value: noreply@yourcrm.com
```

### Redis (Caching)

```
Name: REDIS_URL
Value: redis://username:password@host:6379
```

### Stripe (Payments)

```
Name: STRIPE_SECRET_KEY
Value: sk_test_... or sk_live_...

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_...
```

### Alternative OpenAI (Fallback)

```
Name: OPENAI_API_KEY
Value: sk-... (from platform.openai.com)
```

---

## ☁️ AZURE DEPLOYMENT SECRETS

### Azure Credentials

Run in PowerShell:

```powershell
# Login to Azure
az login

# Get subscription ID
$subscriptionId = az account show --query id -o tsv
Write-Host "Subscription ID: $subscriptionId"

# Create service principal
az ad sp create-for-rbac `
  --name "powerful-crm-github" `
  --role contributor `
  --scopes "/subscriptions/$subscriptionId/resourceGroups/powerful-crm-rg" `
  --sdk-auth
```

Copy the ENTIRE JSON output and add:

```
Name: AZURE_CREDENTIALS
Value: [paste entire JSON]
```

### Azure Container Registry

```powershell
# Get registry credentials
az acr credential show --name powerfulcrm
```

Add both:

```
Name: REGISTRY_USERNAME
Value: powerfulcrm

Name: REGISTRY_PASSWORD
Value: [password from command output]
```

---

## ✅ VERIFICATION CHECKLIST

After adding secrets, check:

- [ ] `GOOGLE_PLACES_API_KEY` added ✅
- [ ] `JWT_SECRET` added (40+ chars)
- [ ] `JWT_REFRESH_SECRET` added (40+ chars)
- [ ] `DATABASE_URL` added
- [ ] `BACKEND_URL` added
- [ ] `FRONTEND_URL` added
- [ ] `CORS_ORIGIN` added
- [ ] Telnyx secrets added (if using)
- [ ] Azure AI secrets added (if using)
- [ ] Optional secrets added as needed

**Minimum to deploy:** First 7 secrets (Google + JWT + Database + URLs)

---

## 🧪 TEST YOUR SECRETS

After adding, test by pushing a commit:

```powershell
cd "U:\Powerful CRM"

# Make a small change
Add-Content -Path README.md -Value "`n<!-- Testing deployment -->"

# Commit and push
git add .
git commit -m "test: Verify GitHub Secrets configuration"
git push origin master

# Watch the deployment
Start-Process "https://github.com/eli-ize/powerful-crm/actions"
```

---

## 🚨 COMMON MISTAKES

### ❌ Wrong secret name
- GitHub secret names are **case-sensitive**
- Must match **exactly** what's in workflow file
- Example: `GOOGLE_PLACES_API_KEY` not `google_places_api_key`

### ❌ Extra spaces
- Copy/paste can add spaces
- Trim spaces before and after value
- Example: `"abc123 "` should be `"abc123"`

### ❌ Wrong format
- Database URL: Must start with `postgresql://`
- URLs: Must include `https://` or `http://`
- JWT secrets: Should be 32+ characters

### ❌ Using test values
- Don't use placeholder values like "your_key_here"
- Generate real secrets
- Get real API keys from providers

---

## 💡 QUICK REFERENCE

### Secret Priority:

**🔴 Critical (Do Now):**
1. GOOGLE_PLACES_API_KEY
2. JWT_SECRET
3. JWT_REFRESH_SECRET
4. DATABASE_URL

**🟡 Important (This Week):**
5. BACKEND_URL
6. FRONTEND_URL
7. CORS_ORIGIN
8. Azure AI secrets

**🟢 Optional (As Needed):**
9. Telnyx (if using calls)
10. SMTP (if using email)
11. Stripe (if using payments)

---

## 🆘 NEED HELP?

### Can't find GitHub Secrets page?
```
Direct link: https://github.com/eli-ize/powerful-crm/settings/secrets/actions
```

### Don't have Azure credentials yet?
```
Follow: AZURE_AI_SETUP_GUIDE.md
Or skip Azure secrets for now and add later
```

### Need to generate strong passwords?
```powershell
# Generate random 40-char string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})
```

### Forgot your database password?
```
Check your database provider's dashboard
Or create a new database with known password
```

---

## 📞 NEXT STEPS

After adding secrets:

1. ✅ **Also add to local backend/.env** (see below)
2. ✅ **Test deployment** (push to GitHub)
3. ✅ **Monitor GitHub Actions** for errors
4. ✅ **Check Azure Portal** for deployment status

---

## 📝 ADD TO LOCAL .ENV TOO!

Don't forget to add the same secrets to your local development environment:

```powershell
cd "U:\Powerful CRM\backend"

# Edit .env file
notepad .env

# Or use PowerShell to add:
@"
GOOGLE_PLACES_API_KEY=[YOUR_GOOGLE_PLACES_API_KEY]
JWT_SECRET=[your generated JWT secret]
JWT_REFRESH_SECRET=[your generated refresh secret]
DATABASE_URL=postgresql://postgres:password@localhost:5432/powerfulcrm
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
"@ | Add-Content -Path .env
```

---

**Ready to add secrets?** The GitHub page should be open in your browser! 🚀

Start with the Google Places API key and JWT secrets - those are the most important!
