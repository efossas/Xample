#!/bin/bash

# db
chmod 750 /var/www/gitwise/db/destroy.sh
chmod 750 /var/www/gitwise/db/initialize.sh
chmod 750 /var/www/gitwise/db/sqlGenerator.js

# setup
chmod 750 /var/www/gitwise/setup/connect.sh
chmod 750 /var/www/gitwise/setup/docker.sh
chmod 750 /var/www/gitwise/setup/gateway.sh

# xample
chmod 750 -R /var/www/gitwise/xample
chmod 770 -R /var/www/gitwise/xample/error
chmod 770 /var/www/gitwise/xample/public/xm

# root folder
chmod 750 /var/www/gitwise/sync-xample.sh
