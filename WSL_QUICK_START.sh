#!/bin/bash

# Quick setup guide for running from WSL
# Copy and paste these commands into your WSL terminal

# Step 1: Navigate to project
cd /mnt/d/project/pma/weather

# Step 2: Verify Docker is accessible
docker --version
docker compose --version

# Step 3: Clean up any previous builds (optional, but recommended first time)
docker compose down -v 2>/dev/null || true

# Step 4: Build images (this will take a few minutes first time)
echo "Building Docker images..."
docker compose build

# Step 5: Start containers
echo "Starting containers..."
docker compose up

# ================================================
# If successful, you should see:
# ================================================
# - Backend running on http://localhost:8888
# - Frontend running on http://localhost:3000
# - Both services healthy and ready to accept requests

# ================================================
# In another WSL terminal, you can run:
# ================================================

# View logs
docker compose logs -f

# View only backend logs
docker compose logs -f backend

# View only frontend logs  
docker compose logs -f frontend

# Stop containers (press Ctrl+C in the main terminal, or run this in another terminal)
docker compose down

# ================================================
# Troubleshooting
# ================================================

# If Docker is not found, you may need to:
# 1. Ensure Docker Desktop is running on Windows
# 2. Check that Docker is enabled for WSL 2 integration (Docker Desktop Settings → Resources → WSL Integration)

# If you get permission errors, try:
# sudo docker compose build
# sudo docker compose up

# If ports are already in use, edit docker-compose.yml and change the ports section:
# backend:
#   ports:
#     - "8001:8000"  # Changed from 8000:8000
# frontend:
#   ports:
#     - "3001:3000"  # Changed from 3000:3000
