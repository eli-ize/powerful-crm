# Quick Fix Needed

## Issue
App needs JWT_REFRESH_SECRET to be at least 32 characters.

## Fix
1. Go to: https://github.com/eli-ize/powerful-crm/settings/secrets/actions
2. Click JWT_REFRESH_SECRET
3. Update value to: `production-refresh-secret-2025-secure-key-long-enough`
4. Save

## Then Deploy
```powershell
git commit --allow-empty -m "Redeploy with fixed JWT secret"
git push origin deploy-clean
```

## Telnyx Webhook
Update to: `https://powerful-crm.gentlepond-89090d4a.eastus.azurecontainerapps.io/api/calls/webhook`

At: https://portal.telnyx.com/#/app/outbound_voice_profiles
(Use Outbound Voice Profile, not TeXML)
