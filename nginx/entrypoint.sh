#!/bin/sh
set -e

echo "Substituting environment variables in Nginx config..."
envsubst '$NGINX_APP_KEY' < /etc/nginx/templates/web.conf > /etc/nginx/conf.d/web.conf

echo "Starting Nginx..."
exec nginx -g 'daemon off;'