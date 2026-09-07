FROM oven/bun:1.3.5-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN bun install

COPY . .

RUN bun run build

FROM oven/bun:1.3.5-alpine AS production
WORKDIR /app

COPY package.json package-lock.json* ./
RUN bun install --production

COPY --from=build /app/dist /app/dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "dist/main.js"]
