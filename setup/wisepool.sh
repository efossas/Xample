### install dependencies on ubuntu 16 docker container

### apt-get update
### apt-get install -y git wget
### wget https://raw.githubusercontent.com/efossas/Xample/master/setup/wisepool.sh?token=AF3Rh4UFtQn9nUb685IY8jwNCGcl9w6Tks5Y880WwA%3D%3D -O wisepool.sh

### ./wisepool.sh
### ./permission.sh
### ./connect.sh -s 'node' -p 'password'
### ./gateway.sh

while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -m|--mongo)
    MONGO="$2"
    shift
    ;;
    -r|--redis)
    REDIS="$2"
    shift
    ;;
    -s|--sql)
    SQL="$2"
    shift
    ;;
    *)
    # unknown option
    ;;
esac
shift
done

if [ -z "$MONGO" ]; then echo "ERROR Usage: -m mongo-pass -r redis-pass -s mysql-pass"; exit 1; fi
if [ -z "$REDIS" ]; then echo "ERROR Usage: -m mongo-pass -r redis-pass -s mysql-pass"; exit 1; fi
if [ -z "$SQL" ]; then echo "ERROR Usage: -m mongo-pass -r redis-pass -s mysql-pass"; exit 1; fi

# always stay in root home folder when possible
cd ~

# update
apt-get update

# build-essential curl git
apt-get install -y build-essential curl

# ruby dependencies
apt-get install -y zlib1g-dev libssl-dev libreadline-dev libyaml-dev libxml2-dev libxslt-dev

# clean
apt-get clean

# apache
apt-get install -y apache2
a2dissite 000-default.conf
a2enmod proxy
a2enmod proxy_http

service apache2 restart

# sass
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
cd ~/.rbenv && src/configure && make -C src
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
rbenv install --verbose 2.4.0
rbenv global 2.4.0
gem install sass
cd ~

# nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc

# node
nvm install node

# npm
apt-get install -y npm

# imagemagick
apt-get install -y imagemagick

# mysql
debconf-set-selections <<< "mysql-server mysql-server/root_password password $SQL"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $SQL"
apt-get install -y mysql-server

mysql --user=root --password="$SQL" -e "DROP USER ''@'localhost'"
mysql --user=root --password="$SQL" -e "DROP USER ''@'$(hostname)'"
mysql --user=root --password="$SQL" -e "DROP DATABASE test"
mysql --user=root --password="$SQL" -e "FLUSH PRIVILEGES"

# redis
apt-get install -y tcl8.5
curl -O http://download.redis.io/releases/redis-3.2.8.tar.gz
tar xzf redis-3.2.8.tar.gz
rm redis-3.2.8.tar.gz
cd redis-3.2.8
make
make install
echo -n | utils/install_server.sh
cd ~

# secure redis
sed -i "s/# requirepass foobared/requirepass $REDIS/g" /etc/redis/6379.conf

redis-server /etc/redis/6379.conf

# mongo
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.4.list
apt-get update
apt-get install -y mongodb-org

service mongod restart
mongo admin --eval "db.createUser({user:'root',pwd:'$MONGO',roles:['root']})"
service mongod stop

sed -i 's/#security:/security:\n  authorization: enabled/g' /etc/mongod.conf

service mongod restart

# if libre office is needed, dpkg -i *.deb

# unoconv (libre office auto-installed with it)
apt-get install -y unoconv

# ffmpeg
curl -O https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz
tar xf ffmpeg-release-64bit-static.tar.xz
mv ffmpeg-3.2.4-64bit-static/ffmpeg /usr/local/bin/ffmpeg
mv ffmpeg-3.2.4-64bit-static/ffprobe /usr/local/bin/ffprobe
mv ffmpeg-3.2.4-64bit-static/ffserver /usr/local/bin/ffserver
mv ffmpeg-3.2.4-64bit-static/qt-faststart /usr/local/bin/qt-faststart
rm ffmpeg-release-64bit-static.tar.xz
rm -rf ffmpeg-3.2.4-64bit-static

# clone xample repo & install
git clone https://github.com/efossas/JS-Xample /var/www/gitwise
mkdir /var/www/wisepool

chmod 500 /var/www/gitwise/setup/permissions.sh
/var/www/gitwise/setup/permissions.sh

/var/www/gitwise/sync-xample.sh -p -i

cd /var/www/gitwise/db
./initialize.sh -m $MONGO -s $SQL

cd ~

unset MONGO
unset MYSQL
unset REDIS

history -wc
