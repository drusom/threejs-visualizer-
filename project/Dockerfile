# Multi-stage build for React + Express app

# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Prepare the backend
FROM node:18-alpine AS backend-builder
WORKDIR /app

# Copy and install backend dependencies
COPY api/package*.json ./api/
RUN cd api && npm ci --only=production

# Stage 3: Final production image
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies and code
COPY --from=backend-builder /app/api/node_modules ./api/node_modules
COPY api/package.json ./api/
COPY api/index.js ./api/

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Copy public assets (important for 3D models!)
COPY --from=frontend-builder /app/public ./public

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["node", "api/index.js"] 