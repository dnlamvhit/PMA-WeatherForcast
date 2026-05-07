#!/bin/bash

# Docker deployment startup script for WSL
# This script builds and starts the Weather application with Docker

set -e  # Exit on error

echo "=========================================="
echo "Weather App - Docker Deployment"
echo "=========================================="
echo ""

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

echo "✓ Docker found"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose not found, trying 'docker compose'"
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "Using: $DOCKER_COMPOSE"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build images
echo -e "${BLUE}📦 Building Docker images...${NC}"
$DOCKER_COMPOSE build

echo ""
echo -e "${BLUE}🚀 Starting containers...${NC}"
$DOCKER_COMPOSE up

echo ""
echo -e "${GREEN}✓ Containers started!${NC}"
echo ""
echo "=========================================="
echo "Application is running!"
echo "=========================================="
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================================="
