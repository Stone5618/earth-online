# Frontend Dockerfile (multi-stage build)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json .
RUN npm ci

# Copy code
COPY . .

# Build
RUN npm run build

# Production stage (serves static files)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
