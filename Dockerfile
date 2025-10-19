# Docker configuration
FROM nginx:alpine

# Copy web files
COPY web/ /usr/share/nginx/html/

# Copy custom nginx config
COPY nginx-docker.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
