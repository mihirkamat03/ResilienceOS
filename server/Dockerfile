# ==============================================================================
# ResilienceOS Decision Engine Backend - Production Dockerfile
# Lightweight Node.js 20 Alpine Multi-Stage Container
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for server
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy authoritative source code & core decision engines
WORKDIR /app
COPY src/core ./src/core
COPY src/data ./src/data
COPY server ./server

WORKDIR /app/server

# Security: run as non-root user
USER node

EXPOSE 5000

ENV PORT=5000 \
    NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/index.js"]
