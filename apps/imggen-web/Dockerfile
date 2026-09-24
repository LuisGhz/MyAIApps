FROM oven/bun:1.3.5-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build arguments for environment variables (these will be embedded at build time)
ARG VITE_API_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE

# Set environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE

# Build the application
RUN bun run build

FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist/ /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
