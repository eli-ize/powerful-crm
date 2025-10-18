# GitHub Secrets Setup

Add these at: https://github.com/eli-ize/powerful-crm/settings/secrets/actions

## Required Secrets:

### AZURE_CREDENTIALS
Get from your terminal output or run:
```powershell
$env:REQUESTS_CA_BUNDLE="" ; $env:CURL_CA_BUNDLE="" ; az ad sp create-for-rbac --name "powerful-crm-deploy" --role contributor --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/powerful-crm-rg --sdk-auth
```
Copy the entire JSON output.

### BACKEND_URL
```
https://powerful-crm.gentlepond-89090d4a.eastus.azurecontainerapps.io
```

### TELNYX_API_KEY
Your Telnyx API key from: https://portal.telnyx.com

### TELNYX_PUBLIC_KEY  
Your Telnyx public key (if needed)

### TELNYX_CONNECTION_ID
Your Telnyx connection ID

### JWT_SECRET
Any random 32+ character string. Generate with:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### DATABASE_URL
For SQLite (simplest):
```
file:./production.db
```

Or for PostgreSQL:
```
postgresql://user:pass@host:5432/dbname
```

## After Adding Secrets:

Push any commit to `deploy-clean` branch to trigger automatic deployment!
