### set up http(s) connection

while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -n|--node)
    INSTALL="$2"
    shift
    ;;
    -p|--pass)
    PASSWORD="$2"
    shift
    ;;
    *)
    # unknown option
    ;;
esac
shift
done

if [ -z "$MONGO" ]; then echo "ERROR Usage: -m mongo-pass -r redis-pass -s mysql-pass"; exit 1; fi


# 'node' for installing as a node || 'solo' for installing as single server app
if [[ -z "$INSTALL" ]]; then echo "ERROR Usage: -n [node|solo] -p [password]"; exit 1; fi
if [[ -z "$INSTALL" ]]; then echo "ERROR Usage: -n [node|solo] -p [password]"; exit 1; fi

# apache config

if [[ "$INSTALL" == "node" ]]; then
printf "\
<IfModule !mod_ssl.c>\n\
    <VirtualHost *:80>\n\
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
    </VirtualHost>\n\
</IfModule>\n\
<IfModule mod_ssl.c>\n\
    <VirtualHost *:80>\n\
        RewriteEngine On\n\
        RewriteCond %{HTTPS} off\n\
        RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI}\n\
    </VirtualHost>\n\
    <VirtualHost _default_:443>\n\
        ServerAdmin contact@wisepool.io\n\
        ServerName wisepool.io\n\
        ProxyPassMatch ^/(.*)$ http://localhost:2020/\$1\n\
        ProxyPassReverse / http://localhost:2020\n\
        ErrorLog \${APACHE_LOG_DIR}/error.log\n\
        CustomLog \${APACHE_LOG_DIR}/access.log combined\n\
        SSLEngine on\n\
        SSLCertificateFile /etc/apache2/ssl/appsys.crt\n\
        SSLCertificateKeyFile /etc/apache2/ssl/appsys.key\n\
        <FilesMatch "\.(cgi|shtml|phtml|php)$">\n\
            SSLOptions +StdEnvVars\n\
        </FilesMatch>\n\
        <Directory /usr/lib/cgi-bin>\n\
            SSLOptions +StdEnvVars\n\
        </Directory>\n\
        BrowserMatch \"MSIE [2-6]\" nokeepalive ssl-unclean-shutdown downgrade-1.0 force-response-1.0\n\
    </VirtualHost>\n\
    <VirtualHost _default_:443>\n\
        ServerName www.wisepool.io\n\
        Redirect permanent / https://wisepool.io\n\
    </VirtualHost>\n\
</IfModule>\n\n" > /etc/apache2/sites-available/wisepool.io.conf

openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout /etc/apache2/ssl/wisepool.key -out /etc/apache2/ssl/wisepool.crt -subj "/C=US/ST=Colorado/L=Boulder/O=Academic Systems/OU=WisePool/CN=wisepool.io/emailAddress=contact@wisepool.io"

a2enmod ssl
a2enmod headers

a2ensite wisepool.io.conf

service apache2 restart

elif [[ "$INSTALL" == "solo" ]]; then

printf "<VirtualHost *:80>\n\
        ServerName wisepool.io\n\
        ErrorLog \${APACHE_LOG_DIR}/error.log\n\
        CustomLog \${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>\n\n" > /etc/apache2/sites-available/wisepool.io.conf

a2ensite wisepool.io.conf
service apache2 restart

# certbot ssl https
add-apt-repository ppa:certbot/certbot
apt-get update
apt-get install -y python-certbot-apache
certbot -n --agree-tos --email contact@wisepool.io --redirect --apache -d wisepool.io

sed -i 's/ServerName wisepool.io/ServerName wisepool.io\nProxyPassMatch ^\/(.*)$ http:\/\/localhost:2020\/\$1\nProxyPassReverse \/ http:\/\/localhost:2020\n/g' /etc/apache2/sites-available/wisepool.io-le-ssl.conf

service apache2 restart

# certbot renew cron job
printf "30 03 01 */3 * certbot renew\n" >> /etc/crontab

fi

# create backup entry user in case root gets locked out by fail2ban
useradd wsx
gpasswd -a wsx sudo
usermod -g sudo wsx
groupdel wsx
(echo '$PASSWORD'; echo '$PASSWORD') | passwd wsx

unset PASSWORD

sed -i 's/#AuthorizedKeysFile/AuthorizedKeysFile/g' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config

service sshd restart

history -wc

# run xample

node /var/www/wisepool/xample/xample.js prod 2020 0
