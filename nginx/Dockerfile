FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY dev/conf.d/web.conf /etc/nginx/templates/web.conf

CMD ["/entrypoint.sh"]