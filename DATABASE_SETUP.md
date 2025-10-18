# PostgreSQL Database Setup

## Database Details
- **Server Name**: powerfulcrmdb.postgres.database.azure.com
- **Database**: postgres (default)
- **Admin User**: dbadmin
- **Admin Password**: CRMSecure2024!
- **Tier**: Burstable B1ms (FREE for 12 months - 750 hours/month)
- **Storage**: 32 GB
- **Version**: PostgreSQL 14

## Connection String
```
postgresql://dbadmin:CRMSecure2024!@powerfulcrmdb.postgres.database.azure.com:5432/postgres?schema=public&sslmode=require
```

## Next Steps

### 1. Update GitHub Secret
```powershell
gh secret set DATABASE_URL --body "postgresql://dbadmin:CRMSecure2024!@powerfulcrmdb.postgres.database.azure.com:5432/postgres?schema=public&sslmode=require"
```

### 2. Add to Azure Container App Environment
```powershell
az containerapp update --name powerful-crm --resource-group powerful-crm-rg --set-env-vars DATABASE_URL="postgresql://dbadmin:CRMSecure2024!@powerfulcrmdb.postgres.database.azure.com:5432/postgres?schema=public&sslmode=require"
```

### 3. Deploy Updated Code
```powershell
git add -A
git commit -m "Switch to PostgreSQL database"
git push origin deploy-clean
```

## Database Migration
The Dockerfile will automatically run `npx prisma migrate deploy` to create all tables on first deployment.

## Free Tier Limits
- ✅ 750 hours/month (24/7 coverage)
- ✅ 32 GB storage
- ✅ 32 GB backup storage
- ✅ FREE for 12 months
- ⚠️ After 12 months: ~$12/month

## Monitor Usage
```powershell
az monitor metrics list --resource /subscriptions/YOUR_SUB_ID/resourceGroups/powerful-crm-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/powerfulcrmdb --metric-names cpu_percent storage_percent
```
