TEMP_DIR="temp"
mkdir $TEMP_DIR

cp ./public_html $TEMP_DIR/public_html
cp ./xample $TEMP_DIR/xample

sudo brew services start mysql
mysql -uroot

npm install
source ./db/initialize.sql

cd $TEMP_DIR/xample
node xample.js local 2020
