FROM oven/bun:1.4-alpine AS build
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1.4-alpine AS production

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN bun install --production

# Copy built application (includes compiled migrations)
COPY --from=build /app/dist /app/dist

USER nonroot

CMD ["bun", "dist/main.js"]
EXPOSE 3000