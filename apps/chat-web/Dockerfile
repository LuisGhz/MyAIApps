FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build --prod
FROM nginx:alpine AS production
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
USER nonroot
COPY --from=build /app/dist/myaichat/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
