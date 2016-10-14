#!/bin/bash

REPO=

rsync -a -v $REPO/Xample-Git/xample/*.js $REPO/Xample-Test/xample/
rsync -a -v $REPO/Xample-Git/xample/data/* $REPO/Xample-Test/xample/data/
rsync -a -v $REPO/Xample-Git/xample/error/* $REPO/Xample-Test/xample/error/
rsync -a -v $REPO/Xample-Git/xample/loads/* $REPO/Xample-Test/xample/loads/
rsync -a -v $REPO/Xample-Git/xample/routes/* $REPO/Xample-Test/xample/routes/

rsync -a -v $REPO/Xample-Git/xample/public/css/* $REPO/Xample-Test/xample/public/css/
rsync -a -v $REPO/Xample-Git/xample/public/js/* $REPO/Xample-Test/xample/public/js/
