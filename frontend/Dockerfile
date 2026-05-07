# Frontend Dockerfile for Next.js with hot-reload support
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port for frontend
EXPOSE 3000

# Run Next.js in development mode with hot-reload
CMD ["npm", "run", "dev"]
