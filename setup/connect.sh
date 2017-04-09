### set up http(s) connection

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -n|--node)
    INSTALL="node"
    shift
    ;;
    s|--solo)
    INSTALL="solo"
    shift
    ;;
    *)
    # unknown option
    ;;
esac
shift
done

# -n for installing as a node || -s for installing as single server app
if [[ -z "$INSTALL" ]]; then echo "ERROR Usage: -n | -s"; exit 1; fi

# apache config

if [[ "$INSTALL" == "node" ]]; then
printf "\
<IfModule !mod_ssl.c>\
    <VirtualHost *:80>\
        ServerAdmin contact@wisepool.io\n\
        ServerName wisepool.io\n\
        ProxyPassMatch ^/(.*)$ http://localhost:2020/\$1\n\
        ProxyPassReverse / http://localhost:2020\n\
        ErrorLog \${APACHE_LOG_DIR}/error.log\
        CustomLog \${APACHE_LOG_DIR}/access.log combined\
    </VirtualHost>\
    <VirtualHost *:80>\n\
            ServerName www.wisepool.io\n\
            Redirect permanent / http://wisepool.io\n\
    </VirtualHost>\
</IfModule>\
<IfModule mod_ssl.c>\
    <VirtualHost *:80>\
        RewriteEngine On\
        RewriteCond %{HTTPS} off\
        RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI}\
    </VirtualHost>\
    <VirtualHost _default_:443>\
        ServerAdmin contact@wisepool.io\n\
        ServerName wisepool.io\n\
        ProxyPassMatch ^/(.*)$ http://localhost:2020/\$1\n\
        ProxyPassReverse / http://localhost:2020\n\
        ErrorLog \${APACHE_LOG_DIR}/error.log\n\
        CustomLog \${APACHE_LOG_DIR}/access.log combined\n\
        SSLEngine on\
        SSLCertificateFile /etc/apache2/ssl/appsys.crt\
        SSLCertificateKeyFile /etc/apache2/ssl/appsys.key\
        <FilesMatch "\.(cgi|shtml|phtml|php)$">\
            SSLOptions +StdEnvVars\
        </FilesMatch>\
        <Directory /usr/lib/cgi-bin>\
            SSLOptions +StdEnvVars\
        </Directory>\
        BrowserMatch \"MSIE [2-6]\" nokeepalive ssl-unclean-shutdown downgrade-1.0 force-response-1.0\
    </VirtualHost>\
    <VirtualHost _default_:443>\n\
        ServerName www.wisepool.io\n\
        Redirect permanent / https://wisepool.io\n\
    </VirtualHost>\
</IfModule>" > /etc/apache2/sites-available/wisepool.io.conf

openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout /etc/apache2/ssl/wisepool.key -out /etc/apache2/ssl/wisepool.crt -subj "/C=US/ST=Colorado/L=Boulder/O=Academic Systems/OU=WisePool/CN=wisepool.io/emailAddress=contact@wisepool.io"

a2enmod ssl
a2enmod headers

a2ensite wisepool.io.conf

service apache2 restart

elif [[ "$INSTALL" == "solo" ]]; then

printf "<VirtualHost *:80>\n\
        ServerAdmin contact@wisepool.io\n\
        ServerName wisepool.io\n\
        ProxyPassMatch ^/(.*)$ http://localhost:2020/\$1\n\
        ProxyPassReverse / http://localhost:2020\n\
        ErrorLog \${APACHE_LOG_DIR}/error.log\n\
        CustomLog \${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>\n\
<VirtualHost *:80>\n\
        ServerName www.wisepool.io\n\
        Redirect permanent / http://wisepool.io\n\
</VirtualHost>" > /etc/apache2/sites-available/wisepool.io.conf

a2ensite wisepool.io.conf
service apache2 restart

# certbot ssl https
add-apt-repository ppa:certbot/certbot
apt-get update
apt-get install -y python-certbot-apache
certbot -n --agree-tos --email contact@wisepool.io --redirect --apache -d wisepool.io

service apache2 restart

# certbot renew cron job
printf "30 03 01 */3 * certbot renew" >> /etc/crontab

fi

# run xample

node /var/www/wisepool/xample/xample.js prod 2020 0
