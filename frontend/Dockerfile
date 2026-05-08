# Frontend Dockerfile for Next.js with hot-reload support
FROM node:20-alpine

WORKDIR /app

# Copy package files from root
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend application code
COPY frontend .

# Expose port for frontend
EXPOSE 3000

# Run Next.js in development mode with hot-reload
CMD ["npm", "run", "dev"]
