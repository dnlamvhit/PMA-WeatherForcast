@echo off
REM Docker deployment startup script for Windows PowerShell
REM This script builds and starts the Weather application with Docker

echo ==========================================
echo Weather App - Docker Deployment
echo ==========================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    pause
    exit /b 1
)

echo Docker found
echo.

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Using: docker compose
    set DOCKER_COMPOSE=docker compose
) else (
    echo Using: docker-compose
    set DOCKER_COMPOSE=docker-compose
)

echo.

REM Build images
echo [*] Building Docker images...
%DOCKER_COMPOSE% build

echo.
echo [*] Starting containers...
%DOCKER_COMPOSE% up

echo.
echo ==========================================
echo Application is running!
echo ==========================================
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8888
echo API Docs:  http://localhost:8888/docs
echo.
echo Press Ctrl+C to stop
echo ==========================================
