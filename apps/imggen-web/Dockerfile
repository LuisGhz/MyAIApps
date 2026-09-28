FROM nginx:alpine AS production

# Copy Turbo-built assets from the app build context
COPY dist/ /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
