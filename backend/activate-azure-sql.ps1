# Azure SQL Database Activation Script
# This script helps activate your Azure SQL Database that was paused to save costs

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Azure SQL Database Activation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Azure SQL Server Details from .env
$serverName = "powerfulcrmsqlsrv"
$resourceGroup = "powerful-crm-rg"
$databaseName = "powerfulcrmdb"

Write-Host "Server: $serverName" -ForegroundColor Yellow
Write-Host "Database: $databaseName" -ForegroundColor Yellow
Write-Host ""

# Check if Azure CLI is installed
Write-Host "Checking Azure CLI installation..." -ForegroundColor White
$azVersion = az --version 2>&1 | Select-String "azure-cli"
if ($azVersion) {
    Write-Host "✓ Azure CLI is installed" -ForegroundColor Green
} else {
    Write-Host "✗ Azure CLI not found. Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Checking Azure login status..." -ForegroundColor White
$loginStatus = az account show 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Already logged into Azure" -ForegroundColor Green
    $account = $loginStatus | ConvertFrom-Json
    Write-Host "  Account: $($account.user.name)" -ForegroundColor Gray
    Write-Host "  Subscription: $($account.name)" -ForegroundColor Gray
} else {
    Write-Host "✗ Not logged into Azure. Logging in..." -ForegroundColor Yellow
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Login failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Activation Options" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Resume via Azure Portal (Manual)" -ForegroundColor Yellow
Write-Host "  1. Go to: https://portal.azure.com" -ForegroundColor Gray
Write-Host "  2. Search for: $serverName" -ForegroundColor Gray
Write-Host "  3. Select your database: $databaseName" -ForegroundColor Gray
Write-Host "  4. Click 'Resume' button if paused" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Resume via Azure CLI (Automatic)" -ForegroundColor Yellow
Write-Host ""
$response = Read-Host "Do you want to resume the database now? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Resuming database..." -ForegroundColor White
    
    # Try to resume the database
    az sql db resume --name $databaseName --resource-group $resourceGroup --server $serverName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database resumed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Testing connection..." -ForegroundColor White
        
        # Test database connection with Prisma
        Set-Location (Split-Path $PSScriptRoot -Parent)
        Set-Location "backend"
        
        npx prisma db push --skip-generate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Successfully connected to Azure SQL!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "  1. Run: npm run seed (to create test user)" -ForegroundColor Gray
            Write-Host "  2. Run: npm run dev (to start backend)" -ForegroundColor Gray
        } else {
            Write-Host "⚠ Database resumed but connection test failed" -ForegroundColor Yellow
            Write-Host "  The database may still be initializing. Try again in 1-2 minutes." -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ Failed to resume database" -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible reasons:" -ForegroundColor Yellow
        Write-Host "  - Database is already running" -ForegroundColor Gray
        Write-Host "  - Resource group or server name is incorrect" -ForegroundColor Gray
        Write-Host "  - Insufficient permissions" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Try using Azure Portal (Option 1)" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Database activation cancelled." -ForegroundColor Yellow
    Write-Host "To activate later, run this script again or use Azure Portal." -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Configuration Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env is configured correctly
$envFile = ".\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "DATABASE_URL.*sqlserver://") {
        Write-Host "✓ .env configured for Azure SQL Server" -ForegroundColor Green
    } else {
        Write-Host "⚠ .env not configured for Azure SQL Server" -ForegroundColor Yellow
        Write-Host "  Currently using SQLite" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Cost Information" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Azure SQL Serverless pricing:" -ForegroundColor White
Write-Host "  - Auto-pauses after 1 hour of inactivity" -ForegroundColor Gray
Write-Host "  - Costs: ~$0.50/hour when active" -ForegroundColor Gray
Write-Host "  - No cost when paused" -ForegroundColor Gray
Write-Host "  - Estimated: $10-20/month for development" -ForegroundColor Gray
Write-Host ""
Write-Host "To minimize costs:" -ForegroundColor Yellow
Write-Host "  - Use SQLite for local development" -ForegroundColor Gray
Write-Host "  - Only activate Azure SQL for testing/production" -ForegroundColor Gray
Write-Host "  - Database auto-pauses after 1 hour of inactivity" -ForegroundColor Gray
Write-Host ""
