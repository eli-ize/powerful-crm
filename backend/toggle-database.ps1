# Database Toggle Script
# Quickly switch between SQLite (local) and Azure SQL (cloud)

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("sqlite", "azuresql", "status")]
    [string]$Target = "status"
)

$envFile = ".\.env"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Database Configuration Toggle" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $envFile)) {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile -Raw

# Check current configuration
if ($envContent -match "(?m)^DATABASE_URL=""file:") {
    $currentDb = "SQLite"
    $currentIcon = "💾"
} elseif ($envContent -match "(?m)^DATABASE_URL=""sqlserver:") {
    $currentDb = "Azure SQL"
    $currentIcon = "☁️"
} else {
    $currentDb = "Unknown"
    $currentIcon = "❓"
}

if ($Target -eq "status") {
    Write-Host "Current Database: $currentIcon $currentDb" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\toggle-database.ps1 sqlite    - Switch to SQLite (local)" -ForegroundColor Gray
    Write-Host "  .\toggle-database.ps1 azuresql  - Switch to Azure SQL (cloud)" -ForegroundColor Gray
    Write-Host "  .\toggle-database.ps1 status    - Show current configuration" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

if ($Target -eq "sqlite") {
    Write-Host "Switching to SQLite..." -ForegroundColor Yellow
    
    # Comment out Azure SQL, uncomment SQLite
    $envContent = $envContent -replace '(?m)^DATABASE_URL="sqlserver:', '# DATABASE_URL="sqlserver:'
    $envContent = $envContent -replace '(?m)^SHADOW_DATABASE_URL="sqlserver:', '# SHADOW_DATABASE_URL="sqlserver:'
    $envContent = $envContent -replace '(?m)^# DATABASE_URL="file:', 'DATABASE_URL="file:'
    
    # Update schema.prisma
    $schemaFile = ".\prisma\schema.prisma"
    if (Test-Path $schemaFile) {
        $schemaContent = Get-Content $schemaFile -Raw
        $schemaContent = $schemaContent -replace 'provider = "sqlserver"', 'provider = "sqlite"'
        Set-Content -Path $schemaFile -Value $schemaContent -NoNewline
        Write-Host "✓ Updated schema.prisma" -ForegroundColor Green
    }
    
    Set-Content -Path $envFile -Value $envContent -NoNewline
    Write-Host "✓ Switched to SQLite (file:./prisma/dev.db)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. npx prisma generate" -ForegroundColor Gray
    Write-Host "  2. npx prisma db push" -ForegroundColor Gray
    Write-Host "  3. npm run seed (if database is new)" -ForegroundColor Gray
    
} elseif ($Target -eq "azuresql") {
    Write-Host "Switching to Azure SQL..." -ForegroundColor Yellow
    
    # Comment out SQLite, uncomment Azure SQL
    $envContent = $envContent -replace '(?m)^DATABASE_URL="file:', '# DATABASE_URL="file:'
    $envContent = $envContent -replace '(?m)^# DATABASE_URL="sqlserver:', 'DATABASE_URL="sqlserver:'
    $envContent = $envContent -replace '(?m)^# SHADOW_DATABASE_URL="sqlserver:', 'SHADOW_DATABASE_URL="sqlserver:'
    
    # Update schema.prisma
    $schemaFile = ".\prisma\schema.prisma"
    if (Test-Path $schemaFile) {
        $schemaContent = Get-Content $schemaFile -Raw
        $schemaContent = $schemaContent -replace 'provider = "sqlite"', 'provider = "sqlserver"'
        Set-Content -Path $schemaFile -Value $schemaContent -NoNewline
        Write-Host "✓ Updated schema.prisma" -ForegroundColor Green
    }
    
    Set-Content -Path $envFile -Value $envContent -NoNewline
    Write-Host "✓ Switched to Azure SQL Server" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ Important: Azure SQL may be paused to save costs" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. .\activate-azure-sql.ps1 (to resume database)" -ForegroundColor Gray
    Write-Host "  2. npx prisma generate" -ForegroundColor Gray
    Write-Host "  3. npx prisma db push" -ForegroundColor Gray
    Write-Host "  4. npm run seed (if database is new)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Configuration Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💾 SQLite:" -ForegroundColor White
Write-Host "  ✓ Free, fast, no network" -ForegroundColor Green
Write-Host "  ✓ Perfect for development" -ForegroundColor Green
Write-Host "  ✗ Single file, not for production" -ForegroundColor Gray
Write-Host ""
Write-Host "☁️  Azure SQL:" -ForegroundColor White
Write-Host "  ✓ Production-ready, scalable" -ForegroundColor Green
Write-Host "  ✓ Automatic backups" -ForegroundColor Green
Write-Host "  ⚠ Requires network connection" -ForegroundColor Yellow
Write-Host "  ⚠ Costs ~$10-20/month (serverless)" -ForegroundColor Yellow
Write-Host ""
