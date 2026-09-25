FROM oven/bun:1.4-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN bun install
COPY . .
RUN bun run build
FROM nginx:alpine AS production
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
USER nonroot
COPY --from=build /app/dist/myaichat/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
