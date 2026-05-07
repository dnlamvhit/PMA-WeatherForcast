# Docker Quick Reference

## Starting the Application

### Using scripts (Recommended)
```bash
# On Linux/Mac/WSL
./start-docker.sh

# On Windows (Command Prompt)
start-docker.bat

# On Windows (PowerShell)
.\start-docker.bat
```

### Using docker-compose directly
```bash
docker-compose up
docker-compose up -d        # Run in background
docker-compose up --build   # Force rebuild
```

## Stopping the Application

### Using scripts
```bash
# On Linux/Mac/WSL
./stop-docker.sh

# On Windows (Command Prompt)
stop-docker.bat

# On Windows (PowerShell)
.\stop-docker.bat
```

### Using docker-compose directly
```bash
docker-compose down
docker-compose stop  # Just stop, don't remove
```

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last N lines
docker-compose logs --tail=50 backend

# Without timestamps
docker-compose logs -f --no-log-prefix
```

## Working with Containers

```bash
# Execute command in running container
docker-compose exec backend python -c "import sys; print(sys.version)"
docker-compose exec frontend npm run build

# Interactive shell in container
docker-compose exec -it backend bash
docker-compose exec -it frontend sh

# View running containers
docker-compose ps

# Restart a service
docker-compose restart backend
docker-compose restart frontend

# Rebuild specific service
docker-compose build backend
docker-compose build --no-cache frontend
```

## Database Management

```bash
# Access backend container shell
docker-compose exec -it backend bash

# Once in container, you can use sqlite3
sqlite3 data/weather.db ".tables"
sqlite3 data/weather.db ".schema weather_records"
sqlite3 data/weather.db "SELECT COUNT(*) FROM weather_records;"

# Reset database
docker volume rm weather_backend_db
docker-compose restart backend
```

## Troubleshooting

```bash
# Check container status
docker-compose ps

# View full logs (with debug info)
docker-compose logs

# Restart all services
docker-compose restart

# Full rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up

# Remove all data and start fresh
docker-compose down -v
docker-compose up --build

# Check if ports are in use
# On Windows: netstat -ano | findstr :3000
# On Linux/Mac: lsof -i :3000
```

## Environment Variables

Backend environment variables (from docker-compose.yml):
- `DATABASE_URL` - SQLite database path
- `PYTHONUNBUFFERED` - Python output buffering

Frontend environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NODE_ENV` - Set to "development"

## Port Mapping

Current configuration:
- Frontend: http://localhost:3000 → Container port 3000
- Backend: http://localhost:8000 → Container port 8000

To change ports, edit `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Access at localhost:8001
  
  frontend:
    ports:
      - "3001:3000"  # Access at localhost:3001
```

## Performance Tips

1. **Keep node_modules out of volume mount** (already done in frontend)
2. **Use `.dockerignore` to exclude unnecessary files** (already configured)
3. **Run containers in background** with `-d` flag
4. **Monitor resource usage**: `docker stats`

## Common Issues and Solutions

### "Cannot connect to Docker daemon"
- Ensure Docker Desktop is running
- On WSL: Check that WSL 2 backend is enabled in Docker Desktop settings

### "Port already in use"
- Change port mapping in docker-compose.yml
- Or kill existing process: `docker-compose down`

### "Frontend not updating on file changes"
- Ensure volume mount is correct
- Restart frontend: `docker-compose restart frontend`
- Check WSL integration in Docker Desktop

### "Backend crashes on startup"
- Check logs: `docker-compose logs backend`
- Verify requirements.txt is correct
- Rebuild: `docker-compose build --no-cache backend`

## Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Deep clean (careful!)
docker system prune -a --volumes
```

## Advanced

### Override docker-compose for development
Create `docker-compose.override.yml`:
```yaml
version: '3.8'
services:
  backend:
    ports:
      - "8001:8000"  # Different port
  frontend:
    environment:
      - DEBUG=true
```

### Build with custom tags
```bash
docker build -t weather-backend:latest -f backend/Dockerfile ./backend
docker build -t weather-frontend:latest -f frontend/Dockerfile ./frontend
```

### Push to registry
```bash
docker tag weather-backend:latest myregistry/weather-backend:latest
docker push myregistry/weather-backend:latest
```
