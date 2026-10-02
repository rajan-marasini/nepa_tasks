# --- Stage 1: Build React Frontend ---
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and config files
COPY index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY public ./public
COPY src ./src

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:8000
ARG VITE_WS_URL=ws://localhost:8000/ws

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Build production distribution bundle
RUN bun run build

# --- Stage 2: Production Nginx Web Server ---
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
