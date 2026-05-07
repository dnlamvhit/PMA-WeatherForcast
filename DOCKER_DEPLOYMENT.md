# Docker Deployment Guide for WSL

This guide explains how to deploy and run the Weather application on WSL with Docker using mounted volumes for automatic code reload.

## Prerequisites

- WSL 2 (Windows Subsystem for Linux 2) installed
- Docker Desktop for Windows with WSL 2 backend
- Git for Windows

## Quick Start

### 1. Clone/Navigate to Project

```bash
cd /path/to/project/Weather
```

### 2. Build and Start Containers

```bash
docker-compose build
docker-compose up
```

The `--watch` flag is built into the Dockerfile configurations:
- **Backend** (FastAPI): Uses `--reload` flag in uvicorn
- **Frontend** (Next.js): Uses `npm run dev` which has watch mode by default

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## How Auto-Reload Works

### Volume Mounts in docker-compose.yml

```yaml
# Backend - entire directory mounted
volumes:
  - ./backend:/app
  - backend_db:/app/data

# Frontend - directory mounted, but node_modules excluded
volumes:
  - ./frontend:/app
  - /app/node_modules
  - /app/.next
```

### Backend Hot Reload

- **Technology**: Uvicorn with `--reload` flag
- **What triggers reload**: Changes to `.py` files in `/backend`
- **File watching**: Automatic via Uvicorn's watchdog
- **Speed**: Instant reload on save

### Frontend Hot Reload

- **Technology**: Next.js Fast Refresh
- **What triggers reload**: Changes to `.jsx`, `.css`, `.js` files in `/frontend`
- **File watching**: Automatic via webpack dev server
- **Speed**: Near-instant updates, sometimes with preserving state

## Development Workflow

### Making Backend Changes

1. Edit any Python file in `./backend/`
2. Save the file
3. Backend automatically reloads (check container logs)
4. Refresh browser or make API calls immediately

### Making Frontend Changes

1. Edit any `.jsx`, `.css`, or `.js` file in `./frontend/`
2. Save the file
3. Next.js Fast Refresh applies changes
4. Browser updates automatically (hot reload) or refresh to see changes

### Common Commands

```bash
# Start all containers in background
docker-compose up -d

# View logs from both services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Rebuild images (after dependency changes)
docker-compose build --no-cache

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## Troubleshooting

### Backend Container Won't Start

1. Check logs: `docker-compose logs backend`
2. Verify `requirements.txt` is up to date
3. Rebuild image: `docker-compose build --no-cache backend`
4. Restart: `docker-compose restart backend`

### Frontend Not Updating on Changes

1. Check logs: `docker-compose logs frontend`
2. Ensure mounted volume is correct (check Docker Desktop WSL settings)
3. Restart container: `docker-compose restart frontend`
4. Clear Next.js cache: `docker-compose exec frontend rm -rf .next`

### Port Already in Use

If ports 3000 or 8000 are already in use:

Option 1 - Change ports in docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # Access at localhost:3001
  - "8001:8000"  # Access at localhost:8001
```

Option 2 - Kill existing processes:
```bash
# On Windows (PowerShell as Admin)
Get-Process -Name "node" | Stop-Process -Force
Get-Process -Name "python" | Stop-Process -Force
```

### Database Persistence

- Database is stored in `backend_db` Docker volume
- Located at `/app/data/weather.db` inside container
- Persists between container restarts
- To reset: `docker volume rm weather_backend_db`

### WSL File System Performance

For best performance on Windows/WSL:

1. Clone the project inside WSL filesystem (e.g., `/home/user/projects/`)
   - Not on Windows drive (`/mnt/c/...`)

2. If on Windows drive, enable WSL file caching:
   ```bash
   # In WSL terminal
   echo '[interop]
   enabled = false
   appendWindowsPath = false' | sudo tee /etc/wsl.conf > /dev/null
   ```

## Docker Configuration Details

### docker-compose.yml Features

1. **Service Dependencies**: Frontend waits for backend health check
2. **Health Check**: Backend checks API availability
3. **Network Bridge**: Services communicate via internal network
4. **Environment Variables**: Configured for Docker environment
5. **Volumes**: Both data persistence and hot-reload

### Dockerfile Details

**Backend (backend/Dockerfile)**:
- Based on `python:3.11-slim`
- Installs dependencies from `requirements.txt`
- Runs: `python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
- Watch mode: Automatic via uvicorn's file watcher

**Frontend (frontend/Dockerfile)**:
- Based on `node:18-alpine`
- Installs dependencies with `npm ci`
- Runs: `npm run dev`
- Watch mode: Built-in Next.js development server

## Production Deployment

For production deployment (without hot-reload):

1. Create `docker-compose.prod.yml`:
```yaml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    # Remove volumes mount
    # Change CMD to production command

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    # Remove volumes mount
    # Change CMD to production build
```

2. Create `backend/Dockerfile.prod`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
```

3. Deploy: `docker-compose -f docker-compose.prod.yml up -d`

## Scaling

To run multiple replicas of frontend/backend:

```bash
docker-compose up --scale backend=2 --scale frontend=2
```

Note: Frontend replicas share the same port (requires load balancer).

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/concepts/)
- [Next.js Deployment](https://nextjs.org/docs/deployment/static-exports)
