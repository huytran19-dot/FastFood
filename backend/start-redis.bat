@echo off
echo Starting Redis container...

docker ps -a --filter "name=redis-fastfood" --format "{{.Names}}" | findstr redis-fastfood >nul
if %errorlevel% == 0 (
    echo Redis container exists. Starting it...
    docker start redis-fastfood
) else (
    echo Creating new Redis container...
    docker run -d -p 6379:6379 --name redis-fastfood redis:latest
)

timeout /t 2 /nobreak >nul

docker ps --filter "name=redis-fastfood" --format "{{.Names}}" | findstr redis-fastfood >nul
if %errorlevel% == 0 (
    echo.
    echo Redis is running on port 6379!
    echo Connection: localhost:6379
) else (
    echo.
    echo Failed to start Redis. Please check Docker Desktop is running.
    echo Make sure Docker Desktop is started, then run this script again.
)

pause

