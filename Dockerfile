# Use Node.js v22.7.0 Alpine as the base image
FROM node:22.7.0-alpine

# Install required dependencies (openssl, musl-dev for native modules)
RUN apk update && apk add --no-cache \
    openssl \
    musl-dev \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies using npm ci for reproducible builds
RUN npm ci --force

# Copy the full application code
COPY . .

# Generate Prisma client (required before build/start)
RUN npx prisma generate

# Expose the app port (default to 3000, fallback if APP_PORT isn't defined at build time)
ARG APP_PORT=3000
ENV APP_PORT=${APP_PORT}
EXPOSE ${APP_PORT}

# Start the app: run DB migrations and launch the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
