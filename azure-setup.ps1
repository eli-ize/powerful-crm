# Azure Container Apps Setup Script for Powerful CRM
# This script sets up the complete infrastructure on Azure

param(
    [string]$ResourceGroup = "powerful-crm-rg",
    [string]$Location = "eastus",
    [string]$ContainerAppName = "powerful-crm",
    [string]$RegistryName = "powerfulcrm",
    [string]$EnvironmentName = "powerful-crm-env"
)

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 Powerful CRM - Azure Deployment Setup 🚀      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if Azure CLI is installed
Write-Host "[1/8] Checking Azure CLI..." -ForegroundColor Yellow
$azVersion = az --version 2>$null
if (-not $azVersion) {
    Write-Host "      ❌ Azure CLI not found!" -ForegroundColor Red
    Write-Host "      Download from: https://aka.ms/installazurecliwindows`n" -ForegroundColor Yellow
    exit 1
}
Write-Host "      ✓ Azure CLI installed`n" -ForegroundColor Green

# Login to Azure
Write-Host "[2/8] Logging into Azure..." -ForegroundColor Yellow
az login --use-device-code
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ❌ Azure login failed!`n" -ForegroundColor Red
    exit 1
}
Write-Host "      ✓ Logged in successfully`n" -ForegroundColor Green

# Create Resource Group
Write-Host "[3/8] Creating Resource Group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none
Write-Host "      ✓ Resource Group: $ResourceGroup`n" -ForegroundColor Green

# Create Container Registry
Write-Host "[4/8] Creating Container Registry..." -ForegroundColor Yellow
Write-Host "      (This may take 2-3 minutes...)" -ForegroundColor Gray
az acr create `
    --resource-group $ResourceGroup `
    --name $RegistryName `
    --sku Basic `
    --admin-enabled true `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "      ⚠️  Registry might already exist, continuing...`n" -ForegroundColor Yellow
}
Write-Host "      ✓ Container Registry: $RegistryName.azurecr.io`n" -ForegroundColor Green

# Get registry credentials
Write-Host "[5/8] Retrieving registry credentials..." -ForegroundColor Yellow
$registryUsername = az acr credential show --name $RegistryName --query username --output tsv
$registryPassword = az acr credential show --name $RegistryName --query "passwords[0].value" --output tsv
Write-Host "      ✓ Credentials retrieved`n" -ForegroundColor Green

# Create Container Apps Environment
Write-Host "[6/8] Creating Container Apps Environment..." -ForegroundColor Yellow
Write-Host "      (This may take 3-5 minutes...)" -ForegroundColor Gray
az containerapp env create `
    --name $EnvironmentName `
    --resource-group $ResourceGroup `
    --location $Location `
    --output none

if ($LASTEXITCODE -ne 0) {
    Write-Host "      ⚠️  Environment might already exist, continuing...`n" -ForegroundColor Yellow
}
Write-Host "      ✓ Environment: $EnvironmentName`n" -ForegroundColor Green

# Create Container App
Write-Host "[7/8] Creating Container App..." -ForegroundColor Yellow
az containerapp create `
    --name $ContainerAppName `
    --resource-group $ResourceGroup `
    --environment $EnvironmentName `
    --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest `
    --target-port 8000 `
    --ingress external `
    --registry-server "$RegistryName.azurecr.io" `
    --registry-username $registryUsername `
    --registry-password $registryPassword `
    --cpu 0.5 `
    --memory 1.0Gi `
    --min-replicas 1 `
    --max-replicas 3 `
    --env-vars `
        NODE_ENV=production `
        PORT=8000 `
    --output none

Write-Host "      ✓ Container App: $ContainerAppName`n" -ForegroundColor Green

# Get the app URL
Write-Host "[8/8] Getting application URL..." -ForegroundColor Yellow
$appUrl = az containerapp show `
    --name $ContainerAppName `
    --resource-group $ResourceGroup `
    --query properties.configuration.ingress.fqdn `
    --output tsv

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            ✓ Azure Setup Complete! ✓                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Resources Created:" -ForegroundColor Cyan
Write-Host "   • Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "   • Container Registry: $RegistryName.azurecr.io" -ForegroundColor White
Write-Host "   • Container App: $ContainerAppName" -ForegroundColor White
Write-Host "   • Environment: $EnvironmentName" -ForegroundColor White

Write-Host "`n🌐 Application URL:" -ForegroundColor Cyan
Write-Host "   https://$appUrl" -ForegroundColor Green -BackgroundColor Black

Write-Host "`n🔐 Registry Credentials (save these!):" -ForegroundColor Cyan
Write-Host "   Username: $registryUsername" -ForegroundColor White
Write-Host "   Password: $registryPassword" -ForegroundColor Yellow

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Add GitHub Secrets:" -ForegroundColor White
Write-Host "      • Go to: https://github.com/eli-ize/powerful-crm/settings/secrets/actions" -ForegroundColor Gray
Write-Host "      • Add REGISTRY_USERNAME: $registryUsername" -ForegroundColor Gray
Write-Host "      • Add REGISTRY_PASSWORD: $registryPassword" -ForegroundColor Gray
Write-Host "      • Add TELNYX_API_KEY: <your-telnyx-api-key>" -ForegroundColor Gray
Write-Host "      • Add TELNYX_CONNECTION_ID: 2808469699220735458" -ForegroundColor Gray
Write-Host "      • Add BACKEND_URL: https://$appUrl" -ForegroundColor Gray
Write-Host "      • Add JWT_SECRET: $(New-Guid)" -ForegroundColor Gray

Write-Host "`n   2. Get Azure Credentials for GitHub:" -ForegroundColor White
Write-Host "      Run this command:" -ForegroundColor Gray
Write-Host "      az ad sp create-for-rbac --name `"powerful-crm-deploy`" --role contributor --scopes /subscriptions/`$(az account show --query id -o tsv)/resourceGroups/$ResourceGroup --sdk-auth" -ForegroundColor Yellow

Write-Host "`n   3. Push code to GitHub:" -ForegroundColor White
Write-Host "      git add ." -ForegroundColor Gray
Write-Host "      git commit -m `"Add Azure deployment`"" -ForegroundColor Gray
Write-Host "      git push origin main" -ForegroundColor Gray

Write-Host "`n   4. Update Telnyx webhook:" -ForegroundColor White
Write-Host "      New webhook URL: https://$appUrl/api/telnyx/webhook" -ForegroundColor Gray

Write-Host "`n✨ Your CRM will auto-deploy on every push to main branch!`n" -ForegroundColor Green

# Save info to file
$infoFile = "azure-deployment-info.txt"
@"
Powerful CRM - Azure Deployment Information
Generated: $(Get-Date)

Resource Group: $ResourceGroup
Location: $Location
Container Registry: $RegistryName.azurecr.io
Container App: $ContainerAppName
Environment: $EnvironmentName

Application URL: https://$appUrl
Telnyx Webhook URL: https://$appUrl/api/telnyx/webhook

Registry Credentials:
Username: $registryUsername
Password: $registryPassword

GitHub Secrets to Add:
- REGISTRY_USERNAME: $registryUsername
- REGISTRY_PASSWORD: $registryPassword
- TELNYX_API_KEY: <your-telnyx-api-key>
- TELNYX_CONNECTION_ID: 2808469699220735458
- BACKEND_URL: https://$appUrl
- JWT_SECRET: $(New-Guid)
"@ | Out-File -FilePath $infoFile -Encoding UTF8

Write-Host "💾 Deployment info saved to: $infoFile`n" -ForegroundColor Cyan
