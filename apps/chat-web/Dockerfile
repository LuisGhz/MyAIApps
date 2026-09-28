FROM nginx:alpine AS production
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
USER nonroot
COPY dist/myaichat/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
