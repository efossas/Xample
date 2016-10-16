#!/bin/bash

REPO=
TEST=

# copy backend files
rsync -a -v $REPO/xample/*.js $TEST/xample/
rsync -a -v $REPO/xample/data/* $TEST/xample/data/
rsync -a -v $REPO/xample/error/* $TEST/xample/error/
rsync -a -v $REPO/xample/loads/* $TEST/xample/loads/
rsync -a -v $REPO/xample/routes/* $TEST/xample/routes/

# copy frontend files
rsync -a -v $REPO/xample/public/css/* $TEST/xample/public/css/
rsync -a -v $REPO/xample/public/js/* $TEST/xample/public/js/

# add frontend omni functions to js files
cat $TEST/xample/public/js/omni.js >> $TEST/xample/public/js/bp.js
cat $TEST/xample/public/js/omni.js >> $TEST/xample/public/js/lg.js
cat $TEST/xample/public/js/omni.js >> $TEST/xample/public/js/nav.js

# create minified versions of frontend js files
$TEST/xample/node_modules/uglify-js/bin/uglifyjs -mt -o $TEST/xample/public/js/bp.min.js $TEST/xample/public/js/bp.js
$TEST/xample/node_modules/uglify-js/bin/uglifyjs -mt -o $TEST/xample/public/js/lg.min.js $TEST/xample/public/js/lg.js
$TEST/xample/node_modules/uglify-js/bin/uglifyjs -mt -o $TEST/xample/public/js/nav.min.js $TEST/xample/public/js/nav.js
