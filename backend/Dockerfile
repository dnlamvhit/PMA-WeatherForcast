# Backend Dockerfile for FastAPI with hot-reload support
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project (preserves directory structure)
COPY . .

# Set Python path to include /app
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose port for backend
EXPOSE 8000

# Run with reload enabled for development from backend directory
WORKDIR /app/backend
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app/backend"]
