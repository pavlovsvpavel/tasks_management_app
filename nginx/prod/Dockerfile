FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY prod/conf.d/web.conf /etc/nginx/templates/web.conf
COPY prod/conf.d/bad_user_agents.conf /etc/nginx/conf.d/
COPY prod/nginx.conf /etc/nginx/nginx.conf

CMD ["/entrypoint.sh"]