### set up gateway server

# ufw

apt-get install -y ufw

ufw allow 22
ufw allow 80
ufw allow 443
ufw allow proto tcp from 127.0.0.1 port 3306
ufw allow proto tcp from 127.0.0.1 port 6379
ufw allow proto tcp from 127.0.0.1 port 27017
ufw default deny incoming
ufw enable

# fail2ban

apt-get install -y fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

printf "\n\
[http-dos]\n\
enabled = true\n\
port = http,https\n\
filter = http-dos\n\
maxretry = 500\n\
findtime = 5\n\
bantime = 600\n\
action = iptables[name=HTTP, port=http, protocol=tcp]\n" >> /etc/fail2ban/jail.local

sed -i 's/maxretry = 5/maxretry = 10/g' /etc/fail2ban/jail.local

printf "[Definition]\n\
\n\
failregex = ^ -.*GET\n\
\n\
ignoreregex =\n" > /etc/fail2ban/filter.d/http-dos.conf

service fail2ban start

history -wc
