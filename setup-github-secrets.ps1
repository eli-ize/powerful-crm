# Quick Setup Script for GitHub Secrets
# Run this in PowerShell to generate secrets and prepare values

Write-Host "🔐 GENERATING SECRETS FOR GITHUB..." -ForegroundColor Cyan
Write-Host ""

# Generate JWT Secrets
Write-Host "1️⃣  JWT_SECRET (copy this to GitHub):" -ForegroundColor Yellow
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
Write-Host $jwtSecret -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  JWT_REFRESH_SECRET (copy this to GitHub):" -ForegroundColor Yellow
$jwtRefresh = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
Write-Host $jwtRefresh -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  GOOGLE_PLACES_API_KEY (copy this to GitHub):" -ForegroundColor Yellow
Write-Host "[Get your key from: https://console.cloud.google.com/apis/credentials]" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 COPY THESE TO GITHUB SECRETS PAGE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Now go to: https://github.com/eli-ize/powerful-crm/settings/secrets/actions" -ForegroundColor White
Write-Host ""
Write-Host "For each secret above:" -ForegroundColor White
Write-Host "1. Click 'New repository secret'" -ForegroundColor White
Write-Host "2. Enter the Name exactly as shown" -ForegroundColor White
Write-Host "3. Copy and paste the Value" -ForegroundColor White
Write-Host "4. Click 'Add secret'" -ForegroundColor White
Write-Host ""

# Ask if user wants to add to local .env
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "💾 ADD TO LOCAL .ENV FILE?" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$addToEnv = Read-Host "Add these to backend/.env file? (y/n)"

if ($addToEnv -eq 'y' -or $addToEnv -eq 'Y') {
    $envPath = "U:\Powerful CRM\backend\.env"
    
    # Check if .env exists
    if (Test-Path $envPath) {
        Write-Host "✅ Found .env file at: $envPath" -ForegroundColor Green
        
        # Backup existing .env
        Copy-Item $envPath "$envPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-Host "✅ Created backup of existing .env" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Creating new .env file at: $envPath" -ForegroundColor Yellow
    }
    
    # Add secrets to .env
    $envContent = @"

# === Added by setup script $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===

# Authentication
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefresh

# Google Places API
GOOGLE_PLACES_API_KEY=[GET_FROM_GOOGLE_CLOUD_CONSOLE]

# Application URLs (update these for production)
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Database (update with your credentials)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/powerfulcrm

# ============================================================
"@
    
    Add-Content -Path $envPath -Value $envContent
    Write-Host "✅ Added secrets to .env file!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update DATABASE_URL with your actual database credentials!" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. ✅ Add all secrets to GitHub (page should be open in browser)" -ForegroundColor White
Write-Host "2. ✅ Update DATABASE_URL in backend/.env with your database credentials" -ForegroundColor White
Write-Host "3. ✅ Optionally add Azure AI secrets (see AZURE_AI_SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "4. ✅ Test by pushing to GitHub and watching Actions run" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open GitHub Secrets page in browser..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://github.com/eli-ize/powerful-crm/settings/secrets/actions"

Write-Host ""
Write-Host "🚀 Good luck with your deployment!" -ForegroundColor Green
