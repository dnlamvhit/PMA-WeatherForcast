#!/bin/bash

# Fix and restart Docker with corrected uvicorn command

cd /mnt/d/project/pma/weather

echo "Stopping containers..."
docker compose down

echo "Building backend with corrected uvicorn config..."
docker compose build backend --no-cache

echo "Starting containers..."
docker compose up
