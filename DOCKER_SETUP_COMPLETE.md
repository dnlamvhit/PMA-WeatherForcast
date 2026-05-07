# Docker Setup Complete! 🐳

Your Weather application is now configured for WSL Docker deployment with auto-rebuild and hot-reload capabilities.

## What Was Created

### Core Docker Files
1. **backend/Dockerfile** - FastAPI container with uvicorn reload mode
2. **frontend/Dockerfile** - Next.js container with development watch mode
3. **docker-compose.yml** - Orchestrates both services with volume mounts
4. **backend/.dockerignore** - Optimizes build context
5. **.dockerignore** (frontend) - Optimizes build context
6. **.env.docker** - Docker-specific environment variables

### Scripts
- **start-docker.sh** / **start-docker.bat** - Build and start all containers
- **stop-docker.sh** / **stop-docker.bat** - Stop all containers

### Documentation
- **DOCKER_DEPLOYMENT.md** - Comprehensive deployment guide
- **DOCKER_CHEATSHEET.md** - Quick reference for common commands

### Code Changes
- **backend/database.py** - Updated to support environment-based database URL

## How Auto-Rebuild Works

### Backend (Python/FastAPI)
- **Technology**: Uvicorn with `--reload` flag
- **Trigger**: Any `.py` file changes in `./backend/`
- **Speed**: Instant reload on save
- **File watching**: Automatic via watchdog

### Frontend (Next.js)
- **Technology**: Next.js Fast Refresh via webpack dev server
- **Trigger**: Any `.jsx`, `.css`, `.js` file changes in `./frontend/`
- **Speed**: Near-instant hot reload with state preservation
- **File watching**: Automatic via webpack

## Quick Start

### Option 1: Using Scripts (Easiest)

```bash
# Linux/Mac/WSL
./start-docker.sh

# Windows PowerShell
.\start-docker.bat

# Windows Command Prompt
start-docker.bat
```

### Option 2: Direct Docker Compose

```bash
# Build and start
docker-compose up

# Build and start in background
docker-compose up -d --build

# Stop
docker-compose down
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/api/locations

## Development Workflow

1. **Edit Backend Code**
   - Modify any Python file in `./backend/`
   - Save the file
   - Backend automatically reloads (check logs)
   - Your API changes are live

2. **Edit Frontend Code**
   - Modify any React/CSS file in `./frontend/`
   - Save the file
   - Next.js Fast Refresh applies changes
   - Browser updates automatically

3. **View Logs**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f  # All services
   ```

4. **Make API Calls**
   - Backend auto-reloads on changes
   - No need to restart containers
   - Database persists between restarts

## Key Features

✓ **Auto-rebuild on code changes** - No manual restart needed
✓ **Isolated environments** - Backend and frontend separate containers
✓ **Volume mounts** - Direct file sync between host and containers
✓ **Database persistence** - Data survives container restarts
✓ **Health checks** - Frontend waits for backend to be ready
✓ **Bridge network** - Services communicate seamlessly
✓ **Both OS support** - Works on Windows, Linux, and Mac
✓ **WSL optimized** - Configured for best WSL 2 performance

## Volume Structure

```
Host Machine (Windows)          Docker Containers
./backend            →          /app (with reload)
./frontend           →          /app (with reload)
backend_db (volume)  →          /app/data (persistent)
node_modules         →          Not mounted (cached)
.next                →          Not mounted (cached)
```

## Troubleshooting

### Container won't start?
```bash
docker-compose logs backend  # Check backend logs
docker-compose logs frontend # Check frontend logs
```

### Changes not reflecting?
```bash
# Restart the service
docker-compose restart backend
# Or
docker-compose restart frontend
```

### Port already in use?
Edit `docker-compose.yml` and change the port mappings:
```yaml
ports:
  - "3001:3000"  # Changed from 3000
  - "8001:8000"  # Changed from 8000
```

### Slow file sync on Windows?
Keep your project in WSL filesystem instead of `/mnt/c/...`:
```bash
# Best location
~/projects/Weather

# Acceptable but slower
/mnt/c/projects/Weather
```

## Next Steps

1. ✅ Start containers: `./start-docker.sh` or `docker-compose up`
2. ✅ Visit http://localhost:3000
3. ✅ Make code changes and watch them auto-reload
4. ✅ Check logs if anything goes wrong: `docker-compose logs -f`
5. ✅ Read DOCKER_DEPLOYMENT.md for advanced usage

## File Reference

- **DOCKER_DEPLOYMENT.md** - Full documentation and advanced topics
- **DOCKER_CHEATSHEET.md** - Quick command reference
- **docker-compose.yml** - Service orchestration configuration
- **backend/Dockerfile** - Python/FastAPI container definition
- **frontend/Dockerfile** - Node.js/Next.js container definition

## Commands You'll Use Most

```bash
# Start development
docker-compose up

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild (if dependencies change)
docker-compose build --no-cache

# Restart a service
docker-compose restart backend
```

Enjoy your auto-reloading Docker development environment! 🚀
