# Multi-stage build for NestJS API Service
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/dto/package.json ./packages/dto/
COPY packages/entities/package.json ./packages/entities/
COPY packages/utils/package.json ./packages/utils/
COPY packages/interfaces/package.json ./packages/interfaces/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build shared packages first (in dependency order)
WORKDIR /app
RUN pnpm run build:entities || echo "entities build skipped"
RUN pnpm run build:dto || echo "dto build skipped"
RUN pnpm run build:database || echo "database build skipped"
RUN pnpm run build:utils || echo "utils build skipped"

# Build the API application
WORKDIR /app/apps/api
RUN pnpm run build

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install pnpm and curl for production (before creating user)
RUN npm install -g pnpm@8.15.4 && \
    apk add --no-cache curl

# Install production dependencies only
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/dto/package.json ./packages/dto/
COPY packages/entities/package.json ./packages/entities/
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/dto/dist ./packages/dto/dist
COPY --from=builder /app/packages/entities/dist ./packages/entities/dist

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Set permissions
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 5000

# Create startup script
RUN echo '#!/bin/sh\nset -e\necho "Running Prisma migrations..."\nnpx prisma migrate deploy\necho "Starting NestJS application..."\nexec node dist/main' > /app/start.sh && \
    chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
WORKDIR /app/apps/api
CMD ["/app/start.sh"]
