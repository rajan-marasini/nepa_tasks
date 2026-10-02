# --- Stage 1: Dependencies & Build ---
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Copy package manifests
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies for build/types)
RUN bun install --frozen-lockfile

# Copy source code and config
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY drizzle ./drizzle

# --- Stage 2: Production Runtime ---
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Copy node_modules and built app
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/src ./src
COPY --from=base /app/drizzle ./drizzle
COPY --from=base /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=base /app/tsconfig.json ./tsconfig.json

EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "bunx drizzle-kit push && bun run src/server.ts"]
