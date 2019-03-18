FROM nginx:1.12.2-alpine

RUN apk add --update \
  nginx-mod-http-headers-more \
  jq

COPY dist/ /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/vhost.conf /etc/nginx/conf.d
RUN rm -f /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]