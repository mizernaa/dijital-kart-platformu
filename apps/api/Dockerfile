# ── Build Stage ──
FROM node:18-alpine AS builder
WORKDIR /app

# Copy root package manifests (layer caching for deps)
COPY package.json package-lock.json turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# Install all workspace dependencies
RUN npm ci

# Copy full source for all workspace packages
COPY packages/database/ ./packages/database/
COPY packages/types/ ./packages/types/
COPY apps/api/ ./apps/api/

# Generate Prisma client and compile TypeScript
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npm run build --workspace=@dkp/api

# ── Production Stage ──
FROM node:18-alpine
WORKDIR /app

# Copy workspace node_modules (hoisted to root)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/package-lock.json ./

# Copy built packages (workspace symlinks point into node_modules)
COPY --from=builder /app/packages/ ./packages/

# Copy API dist + package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

ENV NODE_ENV=production
ENV UPLOAD_DIR=/app/uploads
RUN mkdir -p /app/uploads

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', r => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/api/dist/index.js"]
