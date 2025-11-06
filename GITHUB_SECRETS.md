# 🔐 GitHub Secrets Configuration Guide

Complete guide for configuring GitHub Secrets for CI/CD deployment of Powerful CRM.

---

## 📍 Where to Add Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret one by one

---

## 🔑 Required Secrets List

### 1. Database Configuration

#### `DATABASE_URL`
**Description:** PostgreSQL connection string for production database  
**Format:** `postgresql://username:password@host:5432/database?schema=public`  
**Example:**
```
postgresql://dbadmin:SecurePass123@powerfulcrm.postgres.database.azure.com:5432/powerfulcrmdb?schema=public&sslmode=require
```

**How to get:**
- Azure PostgreSQL: Copy from Azure Portal → Database → Connection strings
- Local: `postgresql://postgres:password@localhost:5432/powerfulcrm`

#### `SHADOW_DATABASE_URL`
**Description:** Shadow database for Prisma migrations (required for production)  
**Format:** Same as `DATABASE_URL` but with `-shadow` suffix  
**Example:**
```
postgresql://dbadmin:SecurePass123@powerfulcrm.postgres.database.azure.com:5432/powerfulcrmdb_shadow?schema=public&sslmode=require
```

---

### 2. Authentication & Security

#### `JWT_SECRET`
**Description:** Secret key for signing JWT access tokens  
**Requirements:** Minimum 32 characters, random  
**Generate:**
```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
**Example:** `8vF2jK9mN4pQ6rS8tU0wX2yZ4aB6cD8eF0gH2iJ4kL6m`

#### `JWT_REFRESH_SECRET`
**Description:** Secret key for signing JWT refresh tokens  
**Requirements:** Minimum 32 characters, random (MUST be different from JWT_SECRET)  
**Generate:** Same as `JWT_SECRET`  
**Example:** `nO8pQ0rS2tU4vW6xY8zA0bC2dE4fG6hI8jK0lM2nO4p`

---

### 3. Azure OpenAI (AI Chat Features)

#### `AZURE_OPENAI_KEY`
**Description:** Azure OpenAI API key for Phi-4 model  
**Where to find:**
1. Azure Portal → Azure AI Foundry
2. Go to your AI project
3. Settings → Keys and Endpoints
4. Copy **Key 1** or **Key 2**

**Example:** `your-azure-openai-key-here-32-characters-long`

#### `AZURE_OPENAI_ENDPOINT`
**Description:** Azure OpenAI endpoint URL  
**Where to find:** Same location as API key  
**Format:** `https://your-resource-name.openai.azure.com/`  
**Example:** `https://powerful-crm-phi4-mini--resource.services.ai.azure.com/openai/v1/`

#### `AZURE_OPENAI_DEPLOYMENT`
**Description:** Deployment name of your model  
**Common values:**
- `Phi-4-mini-instruct` (recommended for cost efficiency)
- `gpt-4o-mini` (alternative)
- `gpt-35-turbo` (legacy)

**Where to find:** Azure AI Foundry → Deployments

#### `AZURE_OPENAI_API_VERSION`
**Description:** API version to use  
**Recommended:** `2024-05-01-preview`  
**Options:**
- `2024-05-01-preview` (latest, recommended)
- `2024-02-15-preview`
- `2023-12-01-preview`

---

### 4. Azure Speech Services (Voice Features)

#### `AZURE_SPEECH_KEY`
**Description:** Azure Speech Service subscription key  
**Where to find:**
1. Azure Portal → Speech Services
2. Your Speech resource
3. Keys and Endpoint → Copy Key 1

**Example:** `your-azure-speech-key-here-32-characters-long`

#### `AZURE_SPEECH_REGION`
**Description:** Azure region where Speech Service is deployed  
**Recommended:** `southafricanorth` (Johannesburg, South Africa - lowest latency)  
**Other options:**
- `eastus` (USA)
- `westeurope` (Europe)
- `southeastasia` (Asia)

---

### 5. Google Places API (Lead Generation)

#### `GOOGLE_PLACES_API_KEY`
**Description:** Google Places API key for business search  
**How to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable **Places API (New)**
4. Credentials → Create Credentials → API Key
5. Restrict key to Places API

**Example:** `AIzaSyDNVN7_Zcy06tP37ymoHG7uWHUU8cp8Ijw`

**Important:** Enable billing and set usage limits to avoid unexpected charges

---

### 6. Telnyx API (Phone System - Optional)

#### `TELNYX_API_KEY`
**Description:** Telnyx API key for phone calls and SMS  
**How to get:**
1. Sign up at [Telnyx](https://telnyx.com)
2. Go to API Keys section
3. Create new API key

**Example:** `KEYABCDEF1234567890_your_telnyx_api_key_here`

#### `TELNYX_PUBLIC_KEY`
**Description:** Telnyx public key (optional, for WebRTC)  
**Where to find:** Same location as API key

#### `TELNYX_CONNECTION_ID`
**Description:** Telnyx connection ID for call control  
**How to get:**
1. Telnyx Portal → Call Control
2. Create Call Control Application
3. Copy Connection ID

**Example:** `2808469699220735458`

---

### 7. Email Configuration

#### `SMTP_HOST`
**Description:** SMTP server hostname  
**Common values:**
- Gmail: `smtp.gmail.com`
- Outlook: `smtp-mail.outlook.com`
- SendGrid: `smtp.sendgrid.net`

#### `SMTP_PORT`
**Description:** SMTP server port  
**Common values:**
- `587` (TLS, recommended)
- `465` (SSL)
- `25` (unsecured, not recommended)

#### `SMTP_USER`
**Description:** SMTP authentication username  
**Usually:** Your email address

#### `SMTP_PASSWORD`
**Description:** SMTP authentication password  
**For Gmail:** Use App Password (not regular password)
1. Google Account → Security → 2-Step Verification
2. App passwords → Generate
3. Use 16-character code

**Example:** `lukm fvvk ctpy xevz`

#### `EMAIL_FROM`
**Description:** Default sender email address  
**Format:** `noreply@yourdomain.com` or `Your Name <email@domain.com>`  
**Example:** `noreply@campaignit.co.za`

---

### 8. Application URLs

#### `FRONTEND_URL`
**Description:** Production frontend URL  
**Format:** `https://yourdomain.com` (no trailing slash)  
**Example:** `https://powerful-crm.vercel.app`

#### `BACKEND_URL`
**Description:** Production backend API URL  
**Format:** `https://api.yourdomain.com` (no trailing slash)  
**Example:** `https://powerful-crm-api.azurewebsites.net`

#### `CORS_ORIGIN`
**Description:** Allowed CORS origins (comma-separated)  
**Format:** `https://domain1.com,https://domain2.com`  
**Example:** `https://powerful-crm.vercel.app,https://admin.powerful-crm.vercel.app`

---

## 📋 Quick Setup Checklist

Copy this checklist and check off as you add secrets:

```
Database:
□ DATABASE_URL
□ SHADOW_DATABASE_URL

Authentication:
□ JWT_SECRET (generated with openssl rand -base64 32)
□ JWT_REFRESH_SECRET (different from JWT_SECRET)

Azure OpenAI:
□ AZURE_OPENAI_KEY
□ AZURE_OPENAI_ENDPOINT
□ AZURE_OPENAI_DEPLOYMENT
□ AZURE_OPENAI_API_VERSION

Azure Speech:
□ AZURE_SPEECH_KEY
□ AZURE_SPEECH_REGION

Google:
□ GOOGLE_PLACES_API_KEY

Telnyx (Optional):
□ TELNYX_API_KEY
□ TELNYX_PUBLIC_KEY
□ TELNYX_CONNECTION_ID

Email:
□ SMTP_HOST
□ SMTP_PORT
□ SMTP_USER
□ SMTP_PASSWORD
□ EMAIL_FROM

URLs:
□ FRONTEND_URL
□ BACKEND_URL
□ CORS_ORIGIN
```

---

## 🔍 Verification

After adding all secrets, verify they're correctly set:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all secret names listed (values are hidden)
3. Click **Update** on any secret to change its value
4. Secrets are automatically injected into GitHub Actions workflows

---

## 🚀 Testing Deployment

After configuring secrets:

1. Push to your repository
2. GitHub Actions will automatically deploy
3. Check **Actions** tab for deployment status
4. If deployment fails, check logs for missing or incorrect secrets

---

## ⚠️ Security Best Practices

1. **Never commit secrets to Git**
   - Add `.env` to `.gitignore`
   - Never include secrets in code

2. **Use different secrets for staging/production**
   - Create separate GitHub environments
   - Use environment-specific secrets

3. **Rotate secrets regularly**
   - Change JWT secrets every 90 days
   - Regenerate API keys periodically

4. **Use minimum permissions**
   - Azure: Use service principals with limited access
   - Google: Restrict API keys to specific APIs

5. **Monitor usage**
   - Set up billing alerts
   - Monitor API usage in respective consoles

---

## 🆘 Troubleshooting

### "Invalid DATABASE_URL"
- Check connection string format
- Ensure password is URL-encoded (use %40 for @, %23 for #)
- Test connection locally first

### "JWT token invalid"
- Ensure JWT_SECRET is minimum 32 characters
- Same secret must be used for signing and verification
- JWT_SECRET and JWT_REFRESH_SECRET must be different

### "Azure OpenAI authentication failed"
- Verify API key is correct
- Check endpoint URL ends with trailing slash
- Ensure deployment name matches exactly

### "CORS error in production"
- Add production URL to CORS_ORIGIN
- Include protocol (https://)
- No trailing slashes

---

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Telnyx Documentation](https://developers.telnyx.com/)

---

**Last Updated:** November 6, 2025  
**Maintained By:** Eli Ize (ST10129307)
