@echo off
echo ========================================
echo   FastFood - Redis Setup Script
echo ========================================
echo.

echo Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop first
    pause
    exit /b 1
)

echo Docker found!
echo.

echo Checking if Redis container exists...
docker ps -a --filter "name=redis-fastfood" --format "{{.Names}}" | findstr redis-fastfood >nul
if %errorlevel% == 0 (
    echo Redis container found. Starting...
    docker start redis-fastfood
    if %errorlevel% == 0 (
        echo.
        echo ========================================
        echo   SUCCESS: Redis is now running!
        echo ========================================
        echo Connection: localhost:6379
        echo.
        echo You can now restart your backend server.
        echo.
    ) else (
        echo.
        echo ERROR: Failed to start Redis container
        echo Make sure Docker Desktop is running!
        echo.
    )
) else (
    echo Creating new Redis container...
    docker run -d -p 6379:6379 --name redis-fastfood redis:latest
    if %errorlevel% == 0 (
        echo.
        echo ========================================
        echo   SUCCESS: Redis container created and started!
        echo ========================================
        echo Connection: localhost:6379
        echo.
        echo You can now restart your backend server.
        echo.
    ) else (
        echo.
        echo ERROR: Failed to create Redis container
        echo Make sure Docker Desktop is running!
        echo.
    )
)

echo.
echo Testing Redis connection...
timeout /t 2 /nobreak >nul
node check-redis.js

pause

