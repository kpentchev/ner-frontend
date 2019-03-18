#!/usr/bin/env sh
set -o errexit

/usr/sbin/nginx -g "daemon off;" -c /etc/nginx/nginx.conf