# ==========================================
# Stage 1: Build Frontend Assets with Node.js
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# ==========================================
# Stage 2: Serve with Lightweight Nginx Alpine
# ==========================================
FROM nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP ports (both 80 and 3000 for Coolify compatibility)
EXPOSE 80 3000

# Healthcheck for Coolify container monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/healthz || wget --quiet --tries=1 --spider http://127.0.0.1:3000/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
