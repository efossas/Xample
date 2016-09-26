TEMP_DIR="test"
PORT=2020

rm -rf $TEMP_DIR
mkdir $TEMP_DIR

cp -R public_html $TEMP_DIR
cp -R xample $TEMP_DIR

if [ -z $(pgrep "mysqld") ]; then
   echo "No mysql server instance, starting one"
   mysqld &
fi

echo "source ./db/initialize.sql;" | mysql -uroot

cd $TEMP_DIR/xample
echo "Starting Xample on $PORT ... ctrl + c to stop process"
node xample.js local $PORT

echo "source ./db/destroy.sql;" > mysql -uroot
