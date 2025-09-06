FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY dev/conf.d/web.conf /etc/nginx/templates/web.conf
COPY dev/conf.d/bad_user_agents.conf /etc/nginx/conf.d/
COPY dev/nginx.conf /etc/nginx/nginx.conf

CMD ["/entrypoint.sh"]