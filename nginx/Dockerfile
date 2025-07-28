# Use the official Nginx image from Docker Hub
FROM nginx:stable

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx.conf to the container
COPY nginx.conf /etc/nginx/conf.d/