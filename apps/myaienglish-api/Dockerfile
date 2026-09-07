# Stage 1: Build the application
FROM oven/bun:1.3.5-alpine AS build
WORKDIR /app

# Copy package files and install dependencies with Bun
COPY package.json package-lock.json* ./
RUN bun install

# Copy application files
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the built application
FROM oven/bun:1.3.5-alpine AS production
WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json package-lock.json* ./
RUN bun install --production

# Copy built application (includes compiled migrations and datasource config)
COPY --from=build /app/dist /app/dist

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application using Bun runtime
CMD ["bun", "dist/main.js"]
