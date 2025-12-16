# Build stage for frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-build

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
RUN npm ci

# Copy server source
COPY server/ .

# Build server
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy built frontend
COPY --from=frontend-build /app/dist ./dist

# Copy built backend
COPY --from=backend-build /app/server/dist ./server/dist

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/trainingsapp.db

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/dist/index.js"]
