#!/bin/bash

# Stop all running containers
echo "Stopping all containers..."
docker-compose down

echo "Done! Containers stopped and removed."
