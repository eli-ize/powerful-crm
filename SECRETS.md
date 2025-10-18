# GitHub Secrets Guide

## Required Secrets (Must Have)

These are needed for the app to run:

| Secret | Required | Example | Why |
|--------|----------|---------|-----|
| `AZURE_CREDENTIALS` | ✅ | `{"clientId": "..."}` | Deploy to Azure |
| `JWT_SECRET` | ✅ | `prod-jwt-secret-2025-min-32-chars` | Auth tokens |
| `JWT_REFRESH_SECRET` | ✅ | `prod-refresh-secret-2025-min-32-chars` | Refresh tokens |
| `BACKEND_URL` | ✅ | `https://your-app.azurecontainerapps.io` | App URL |
| `DATABASE_URL` | ✅ | `file:./production.db` | SQLite DB |

## Optional - Telnyx Calling (Only if Using Calls)

| Secret | Required | Example | Why |
|--------|----------|---------|-----|
| `TELNYX_API_KEY` | 📞 | `KEY01...` | Make calls |
| `TELNYX_CONNECTION_ID` | 📞 | `1234567890` | Outbound voice profile |
| `TELNYX_PUBLIC_KEY` | 📞 | (optional) | Webhook verification |

## Optional - AI Features (NOT NEEDED NOW)

❌ **You don't need these unless you want AI agents:**

- `AZURE_SPEECH_KEY` - Text-to-speech (TTS)
- `AZURE_SPEECH_REGION` - TTS region
- `AZURE_OPENAI_KEY` - AI conversations
- `AZURE_OPENAI_ENDPOINT` - AI endpoint
- `OPENAI_API_KEY` - Alternative AI

## Optional - Other Features (NOT NEEDED NOW)

❌ **You don't need these:**

- `GOOGLE_PLACES_API_KEY` - Location search
- `SMTP_*` - Email sending
- `STRIPE_*` - Payments
- `AWS_*` - S3 storage

---

## Current Secrets Summary

✅ **You have 11 secrets** - but only need 5!

### Keep These:
1. ✅ AZURE_CREDENTIALS
2. ✅ JWT_SECRET
3. ✅ JWT_REFRESH_SECRET (just added)
4. ✅ BACKEND_URL
5. ✅ DATABASE_URL
6. ✅ TELNYX_API_KEY (if using calls)
7. ✅ TELNYX_CONNECTION_ID (if using calls)

### Can Delete (Optional):
- GOOGLE_PLACES_API_KEY (not using Google Maps yet)
- TELNYX_PUBLIC_KEY (optional verification)
- REGISTRY_* (not needed - using GitHub registry)

---

## Summary

**Minimal setup:** 5 secrets  
**With calling:** 7 secrets  
**With AI/TTS/STT:** 11+ secrets  

**Right now, you have what you need!** The AI/TTS/STT secrets are optional and only add features you're not using yet.
