# настройки nginx, по пути etc/nginx/sites-enabled, 
# если сертификат SSL уже подключен, настройки нужно внести в документ default

# если сертификат подключаем через CertBot
# создаем документ с названием app
# добавить  зависимость в документе etc/nginx/nginx.conf  
#           в строке    include /etc/nginx/sites-enabled/ *;
#           заменить на include /etc/nginx/sites-enabled/app;  
# далее заменить адреса доступа для cors на нужные 

upstream frontend {
        server localhost:3000;
}

upstream backend {
        server localhost:5500;
}



proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m max_size=10g inactive=60m use_temp_path=off;

server {

        set $cors_origin "";
# заменить адреса доступа для cors на нужные 
        if ($http_origin ~ '^https?://(localhost:3000|www\.sinzem\.uno|sinzem\.uno)$') {
                    set $cors_origin $http_origin;
        }

        listen 80;
        server_name sinzem.uno;

        client_max_body_size 50M;

        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";

        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        location /api {
#               rewrite ^/api/(.*) /$1 break;
                proxy_pass http://backend;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;

                proxy_connect_timeout 60s;
                proxy_send_timeout 60s;
                proxy_read_timeout 60s;

                add_header 'Access-Control-Allow-Origin' $cors_origin always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
                add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
                add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;


                if ($request_method = 'OPTIONS') {
                        add_header 'Access-Control-Allow-Origin' $cors_origin;
                        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH';
                        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
                        add_header 'Access-Control-Max-Age' 1728000;
                        add_header 'Content-Type' 'text/plain; charset=utf-8';
                        add_header 'Content-Length' 0;
                        return 204;
                }
        }

        location /socket.io {
                proxy_pass http://backend;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
         }

        location /_next/static {
                proxy_cache STATIC;
                proxy_pass http://frontend;
                proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
                proxy_cache_valid 200 60m;
                proxy_cache_valid 404 1m;
                add_header X-Cache-Status $upstream_cache_status;
         }

        location /static {
                proxy_cache STATIC;
                proxy_ignore_headers Cache-Control;
                proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
                proxy_cache_valid 200 60m;
                proxy_pass http://frontend;
         }


        location / {
                proxy_pass http://frontend;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;

                proxy_connect_timeout 60s;
                proxy_send_timeout 60s;
                proxy_read_timeout 60s;

                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
        }

}

# server {

#       listen 80 default_server;
#       listen [::]:80 default_server;

# }


