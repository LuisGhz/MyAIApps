# Stage 1: Build the Angular application using Bun (pinned stable, small variant)
# Using the `1.3.5-distroless` tag which is a stable, small image (non-canary)
FROM oven/bun:1.3.5-alpine AS build
WORKDIR /app

# Auth0 build-time environment variables
ARG NG_APP_AUTH0_DOMAIN
ARG NG_APP_AUTH0_CLIENT_ID
ARG NG_APP_AUTH0_AUDIENCE
ENV NG_APP_AUTH0_DOMAIN=$NG_APP_AUTH0_DOMAIN
ENV NG_APP_AUTH0_CLIENT_ID=$NG_APP_AUTH0_CLIENT_ID
ENV NG_APP_AUTH0_AUDIENCE=$NG_APP_AUTH0_AUDIENCE


# Copy package files and install dependencies using Bun
COPY package.json package-lock.json* ./
RUN bun install

# Copy application files
COPY . .

# Build the application using Bun
RUN bun run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

# Copy the build output from the build stage
COPY --from=build /app/dist/myaienglish/browser /usr/share/nginx/html

# Copy custom Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
