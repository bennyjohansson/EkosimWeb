# Frontend Dockerfile - Fixed for Alpine Linux
FROM node:18-alpine

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files first (better caching)
COPY modern/package*.json ./

# Install dependencies fresh in container (no node_modules copying)
RUN npm ci

# Copy source code (excluding node_modules due to .dockerignore)
COPY modern/ ./

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY config/nginx.conf /etc/nginx/nginx.conf

# Create non-root user for security
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]