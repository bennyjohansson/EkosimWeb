# API Dockerfile - Fixed for Alpine Linux
FROM node:18-alpine

# Install build dependencies for native modules (including sqlite3)
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Copy package files first (better caching)
COPY legacy/package*.json ./

# Install dependencies fresh in container (fixes sqlite3 architecture issue)
RUN npm ci

# Copy source code (excluding node_modules due to .dockerignore)
COPY legacy/ ./

# Create data directory for database
RUN mkdir -p /app/data && chmod 755 /app/data

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3001

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    http.get('http://localhost:3001/health', (res) => { \
      process.exit(res.statusCode === 200 ? 0 : 1); \
    }).on('error', () => process.exit(1));"

# Start the API server
CMD ["node", "server.js"]