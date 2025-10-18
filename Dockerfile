# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Clean install with exact versions
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy tsconfig and nest config
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy source code
COPY src ./src

# Build
RUN npm run build

# Verify build output
RUN ls -la dist/

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install netcat for database health check
RUN apk add --no-cache netcat-openbsd curl

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev for migrations)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
