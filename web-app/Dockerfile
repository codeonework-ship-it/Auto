# --- Stage 1: build the Vite/React app ---
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching).
COPY package*.json ./
RUN npm ci

# Copy source and build.
COPY . .
# API base URL can be baked in at build time if needed.
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- Stage 2: serve static build with nginx ---
FROM nginx:1.27-alpine AS serve
# SPA-aware nginx config (history fallback).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
