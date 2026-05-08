#!/bin/bash

# Hot-Reload Quick Start Guide
# Run these commands in your WSL terminal

echo "=========================================="
echo "Weather App - Hot-Reload Setup"
echo "=========================================="
echo ""

# Step 1: Navigate to project
echo "[1/4] Navigating to project..."
cd /mnt/d/project/pma/weather

# Step 2: Clean up old containers
echo "[2/4] Cleaning up old containers..."
docker compose down -v 2>/dev/null || true

# Step 3: Build with new config
echo "[3/4] Building with hot-reload configuration..."
docker compose build --no-cache

# Step 4: Start containers
echo "[4/4] Starting containers with hot-reload enabled..."
docker compose up

echo ""
echo "=========================================="
echo "Auto-Reload Ready! ✅"
echo "=========================================="
echo ""
echo "Backend:  http://localhost:8888"
echo "Frontend: http://localhost:3000"
echo "Docs:     http://localhost:8888/docs"
echo ""
echo "Test hot-reload:"
echo "1. Edit backend/main.py and save"
echo "2. Check logs - should show 'Reloading app...'"
echo "3. Edit frontend/src/app/page.jsx and save"
echo "4. Browser should update automatically"
echo ""
echo "View logs in another terminal:"
echo "  docker compose logs -f backend"
echo "  docker compose logs -f frontend"
echo ""
echo "Press Ctrl+C to stop containers"
echo "=========================================="
