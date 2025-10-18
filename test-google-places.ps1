# Google Places API Test Script

Write-Host "Testing Google Places API Integration..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method GET
    Write-Host "SUCCESS: Backend is online" -ForegroundColor Green
    Write-Host "Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Backend is not responding" -ForegroundColor Red
    Write-Host "Please start it with: cd backend; npm run dev" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Search Places
Write-Host "Test 2: Google Places Search (Pizza in NYC)" -ForegroundColor Yellow
try {
    $uri = "http://localhost:8000/api/places/search?query=pizza+in+nyc"
    $response = Invoke-RestMethod -Uri $uri -Method GET -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "SUCCESS: Google Places API is working!" -ForegroundColor Green
        Write-Host "Found: $($response.data.places.Count) places" -ForegroundColor Gray
        Write-Host ""
        
        $count = 0
        foreach ($place in $response.data.places) {
            $count++
            if ($count -gt 3) { break }
            Write-Host "Place: $($place.name)" -ForegroundColor Cyan
            Write-Host "  Address: $($place.formatted_address)" -ForegroundColor Gray
            if ($place.rating) {
                Write-Host "  Rating: $($place.rating) stars ($($place.user_ratings_total) reviews)" -ForegroundColor Gray
            }
            if ($place.formatted_phone_number) {
                Write-Host "  Phone: $($place.formatted_phone_number)" -ForegroundColor Gray
            }
            Write-Host ""
        }
    } else {
        Write-Host "ERROR: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Failed to search places" -ForegroundColor Red
    $errorMsg = $_.Exception.Message
    Write-Host "Details: $errorMsg" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Backend needs restart to load new API key" -ForegroundColor Gray
    Write-Host "2. API key might be invalid" -ForegroundColor Gray
    Write-Host "3. Places API not enabled in Google Cloud Console" -ForegroundColor Gray
}

Write-Host ""
Write-Host "To restart backend:" -ForegroundColor Yellow
Write-Host "1. Stop current backend (Ctrl+C)" -ForegroundColor Gray
Write-Host "2. Run: cd backend; npm run dev" -ForegroundColor Gray
Write-Host "3. Run this test again" -ForegroundColor Gray
