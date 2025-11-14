# Script to start Redis using Docker
# Make sure Docker Desktop is running before executing this script

Write-Host "🚀 Starting Redis container..." -ForegroundColor Cyan

# Check if container already exists
$existingContainer = docker ps -a --filter "name=redis-fastfood" --format "{{.Names}}"

if ($existingContainer -eq "redis-fastfood") {
    Write-Host "📦 Redis container already exists. Starting it..." -ForegroundColor Yellow
    docker start redis-fastfood
} else {
    Write-Host "📦 Creating new Redis container..." -ForegroundColor Yellow
    docker run -d -p 6379:6379 --name redis-fastfood redis:latest
}

# Wait a moment for container to start
Start-Sleep -Seconds 2

# Check if container is running
$running = docker ps --filter "name=redis-fastfood" --format "{{.Names}}"

if ($running -eq "redis-fastfood") {
    Write-Host "✅ Redis is running on port 6379!" -ForegroundColor Green
    Write-Host "🔗 Connection: localhost:6379" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to start Redis. Please check Docker Desktop is running." -ForegroundColor Red
    Write-Host "💡 Make sure Docker Desktop is started, then run this script again." -ForegroundColor Yellow
}

