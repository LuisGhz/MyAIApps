FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

USER nonroot

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application (includes compiled migrations)
COPY --from=build /app/dist /app/dist

# Copy TypeORM CLI wrapper for running migrations with compiled JS
COPY typeorm-cli.js ./

CMD ["node", "--input-type=module", "dist/main.js"]
EXPOSE 3000