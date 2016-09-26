#!/bin/bash

REPO=

rsync -a -v $REPO/Xample-Git/xample/*.js $REPO/Xample-Test/xample/

rsync -a -v $REPO/Xample-Git/xample/data/* $REPO/Xample-Test/xample/data/

rsync -a -v $REPO/Xample-Git/public_html/css/* $REPO/Xample-Test/public_html/css/

rsync -a -v $REPO/Xample-Git/public_html/js/* $REPO/Xample-Test/public_html/js/
