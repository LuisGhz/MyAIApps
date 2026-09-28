# Serve the Turbo-built Angular application with Nginx
FROM nginx:alpine
COPY dist/myaienglish/browser /usr/share/nginx/html

# Copy custom Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
