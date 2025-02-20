// upstream frontend {
//     server localhost:3000;
// }

// upstream backend {
//     server localhost:5500;
// }

// proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m max_size=10g inactive=60m use_temp_path=off;

// server {

// #       listen 80;
// #       server_name sinzem.uno;

// #       client_max_body_size 50M;

// #       add_header X-Frame-Options "SAMEORIGIN";
// #       add_header X-XSS-Protection "1; mode=block";
// #       add_header X-Content-Type-Options "nosniff";

// #       gzip on;
// #       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

// #       location /api {
// #               rewrite ^/api/(.*) /$1 break;
// #               proxy_pass http://backend;
// #               proxy_http_version 1.1;
// #               proxy_set_header Upgrade $http_upgrade;
// #               proxy_set_header Connection 'upgrade';
// #               proxy_set_header Host $host;
// #               proxy_cache_bypass $http_upgrade;

// #               proxy_connect_timeout 60s;
// #               proxy_send_timeout 60s;
// #               proxy_read_timeout 60s;

// #               add_header 'Access-Control-Allow-Origin' '*' always;
// #               add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
// #               add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
// #               add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

// #               if ($request_method = 'OPTIONS') {
// #                       add_header 'Access-Control-Allow-Origin' '*';
// #                       add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH';
// #                       add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
// #                       add_header 'Access-Control-Max-Age' 1728000;
// #                       add_header 'Content-Type' 'text/plain; charset=utf-8';
// #                       add_header 'Content-Length' 0;
// #                       return 204;
// #               }
// #       }


// #       location /socket.io {
// #               proxy_pass http://backend;
// #               proxy_http_version 1.1;
// #               proxy_set_header Upgrade $http_upgrade;
// #               proxy_set_header Connection "upgrade";
// #               proxy_set_header Host $host;
// #               proxy_cache_bypass $http_upgrade;
// #        }

// #       location /_next/static {
// #               proxy_cache STATIC;
// #               proxy_pass http://frontend;
// #               proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
// #               proxy_cache_valid 200 60m;
// #               proxy_cache_valid 404 1m;
// #               add_header X-Cache-Status $upstream_cache_status;
// #        }

// #       location /static {
// #                proxy_cache STATIC;
// #               proxy_ignore_headers Cache-Control;
// #               proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
// #               proxy_cache_valid 200 60m;
// #               proxy_pass http://frontend;
// #        }
    
// #       location / {
// #               proxy_pass http://frontend;
// #               proxy_http_version 1.1;
// #               proxy_set_header Upgrade $http_upgrade;
// #               proxy_set_header Connection 'upgrade';
// #               proxy_set_header Host $host;
// #               proxy_cache_bypass $http_upgrade;
// #
// #               proxy_connect_timeout 60s;
// #               proxy_send_timeout 60s;
// #               proxy_read_timeout 60s;
// #
// #               proxy_set_header X-Real-IP $remote_addr;
// #               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
// #               proxy_set_header X-Forwarded-Proto $scheme;
// #       }
    
    
//     root /var/www/html;
//     index index.html;

//     server_name sinzem.uno;

// #       location /api/ {
// #               proxy_pass http://localhost:5500/;
// #               proxy_http_version 1.1;
// #               proxy_set_header Upgrade $http_upgrade;
// #               proxy_set_header Connection 'upgrade';
// #               proxy_set_header Host $host;
// #               proxy_cache_bypass $http_upgrade;
// #        }

//     location / {
//             proxy_pass http://localhost:3000/;
//         }

//     location /api/ {
//             proxy_pass http://localhost:5500/;
//             proxy_http_version 1.1;
//             proxy_set_header Upgrade $http_upgrade;
//             proxy_set_header Connection 'upgrade';
//             proxy_set_header Host $host;
//             proxy_cache_bypass $http_upgrade;
//     }



//     listen [::]:443 http2 ssl ipv6only=on; # managed by Certbot
//     listen 443 http2 ssl; # managed by Certbo
//     ssl_certificate /etc/letsencrypt/live/sinzem.uno/fullchain.pem; # managed by Certbot
//     ssl_certificate_key /etc/letsencrypt/live/sinzem.uno/privkey.pem; # managed by Certbot
//     include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
//     ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

// }
// # server {
// #       listen 80;
// #       server_name sinzem.uno;

// #       location / {
// #               proxy_pass http://localhost:3000;
// #               proxy_http_version 1.1;
// #               proxy_set_header Upgrade $http_upgrade;
// #               proxy_set_header Connection 'upgrade';
// #               proxy_set_header Host $host;
// #               proxy_cache_bypass $http_upgrade;
//  #      }
// #}
// server {
//     if ($host = sinzem.uno) {
//         return 301 https://$host$request_uri;
//     } # managed by Certbot


//         listen 80 default_server;
//         listen [::]:80 default_server;

//         server_name sinzem.uno;
//     return 404; # managed by Certbot


// }