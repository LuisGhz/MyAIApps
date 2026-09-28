# Package the Turbo-built application
FROM oven/bun:1.3.5-alpine AS production
WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json package-lock.json* ./
RUN bun install --production

# Copy built application (includes compiled migrations and datasource config)
COPY dist /app/dist

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application using Bun runtime
CMD ["bun", "dist/main.js"]
