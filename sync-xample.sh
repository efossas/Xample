#!/bin/bash

# "dev" - development gets full files & testing files
# "sta" - staging gets full files, minified files, & testing files
# "pro" - production gets only minified files

while test $# -gt 0; do
        case "$1" in
                -d|--dev)
                        DENV="dev"
                        shift
                        ;;
                -i|--init)
                        INIT="yes"
                        shift
                        ;;
                -p|--pro)
                        DENV="pro"
                        shift
                        ;;
                -s|--sta)
                        DENV="sta"
                        shift
                        ;;
                *)
                        # unknown option
                        shift
                        ;;
        esac
done

if [[ -z "$DENV" ]]; then DENV="dev"; fi
if [[ -z "$INIT" ]]; then INIT="no"; fi

echo "Running With Environment: $DENV && Initialize: $INIT";

# set directories
if [[ "$DENV" == "dev" ]]; then
    REPO=
    DEST=
else
    REPO=/var/www/gitwise
    DEST=/var/www/wisepool
fi

# check that the REPO & DEST directories exist
if [[ ! -d "$REPO" || ! -d "$DEST" ]]; then
    echo "REPO or DEST folder does not exist! Please create them first.";
    exit 1;
fi

# install node modules on initialize
if [[ "$INIT" == "yes" ]]; then
    mkdir -p $DEST/xample
    rsync -a -v $REPO/xample/package.json $DEST/xample/package.json
    npm --prefix $DEST/xample/ --unsafe-perm install
fi

# create folder if needed
mkdir -p $DEST/xample/data
mkdir -p $DEST/xample/error
mkdir -p $DEST/xample/loads
mkdir -p $DEST/xample/public/css
mkdir -p $DEST/xample/public/js
mkdir -p $DEST/xample/public/js/blocks
mkdir -p $DEST/xample/public/xm
mkdir -p $DEST/xample/routes

if [[ "$DENV" == "dev" || "$DENV" == "sta" ]]; then
    mkdir -p $DEST/xample/front-tests
    mkdir -p $DEST/xample/test
else
    rm -rf $DEST/xample/front-tests
    rm -rf $DEST/xample/test
fi

# create symbolic links for testing scripts
if [[ "$DENV" == "dev" || "$DENV" == "sta" ]]; then
    ln -fs $DEST/xample/node_modules/mocha/mocha.css $DEST/xample/public/css/mocha.css
    ln -fs $DEST/xample/node_modules/mocha/mocha.js $DEST/xample/public/js/mocha.js
    ln -fs $DEST/xample/node_modules/chai/chai.js $DEST/xample/public/js/chai.js
    ln -fs $DEST/xample/front-tests/blocktests.js $DEST/xample/public/js/blocktests.js
    ln -fs $DEST/xample/front-tests/lguidetests.js $DEST/xample/public/js/lguidetests.js
    ln -fs $DEST/xample/front-tests/pagetests.js $DEST/xample/public/js/pagetests.js
else
    rm -f $DEST/xample/public/css/mocha.css
    rm -f $DEST/xample/public/js/mocha.js
    rm -f $DEST/xample/public/js/chai.js
    rm -f $DEST/xample/public/js/blocktests.js
    rm -f $DEST/xample/public/js/lguidetests.js
    rm -f $DEST/xample/public/js/pagetests.js
fi

# convert sass to css & make minified version
if [[ "$DENV" == "dev" ]]; then
    sass --no-cache --sourcemap=none $REPO/xample/public/css/wisepool.scss:$DEST/xample/public/css/wisepool.css
    rm -f $DEST/xample/public/css/wisepool.min.css
fi

if [[ "$DENV" == "sta" ]]; then
    sass --no-cache --sourcemap=none $REPO/xample/public/css/wisepool.scss:$DEST/xample/public/css/wisepool.css
    sass --no-cache --sourcemap=none $REPO/xample/public/css/wisepool.scss:$DEST/xample/public/css/wisepool.min.css --style compressed
fi

if [[ "$DENV" == "pro" ]]; then
    sass --no-cache --sourcemap=none $REPO/xample/public/css/wisepool.scss:$DEST/xample/public/css/wisepool.min.css --style compressed
    rm -f $DEST/xample/public/css/wisepool.css
fi

# copy backend files
rsync -a -v $REPO/xample/*.sh $DEST/xample/
rsync -a -v $REPO/xample/*.js $DEST/xample/
rsync -a -v $REPO/xample/data/* $DEST/xample/data/
rsync -a -v $REPO/xample/error/* $DEST/xample/error/
rsync -a -v $REPO/xample/loads/* $DEST/xample/loads/
rsync -a -v $REPO/xample/routes/* $DEST/xample/routes/

if [[ "$DENV" == "dev" || "$DENV" == "sta" ]]; then
    rsync -a -v $REPO/xample/front-tests/* $DEST/xample/front-tests/
    rsync -a -v $REPO/xample/test/* $DEST/xample/test/
fi

# copy frontend files
rsync -a -v $REPO/xample/public/css/*.css $DEST/xample/public/css/
rsync -a -v $REPO/xample/public/js/* $DEST/xample/public/js/
rsync -a -v $REPO/xample/public/js/blocks/* $DEST/xample/public/js/blocks/
rsync -a -v $REPO/xample/public/xm/index.html $DEST/xample/public/xm/index.html
rsync -a -v $REPO/xample/public/favicon.ico $DEST/xample/public/favicon.ico

# create concatenated bengine & block function file
cat $DEST/xample/public/js/bengine.js \
$DEST/xample/public/js/blocks/asciimath.js \
$DEST/xample/public/js/blocks/audio.js \
$DEST/xample/public/js/blocks/code.js \
$DEST/xample/public/js/blocks/image.js \
$DEST/xample/public/js/blocks/latex.js \
$DEST/xample/public/js/blocks/pdfslide.js \
$DEST/xample/public/js/blocks/title.js \
$DEST/xample/public/js/blocks/video.js \
$DEST/xample/public/js/blocks/wysiwyg.js > $DEST/xample/public/js/btemp.js

# add frontend omni functions to js files
cat $DEST/xample/public/js/btemp.js $DEST/xample/public/js/omni.js $DEST/xample/public/js/bp.js > $DEST/xample/public/js/temp.js
mv $DEST/xample/public/js/temp.js $DEST/xample/public/js/bp.js

cat $DEST/xample/public/js/bengine.js $DEST/xample/public/js/omni.js $DEST/xample/public/js/lg.js > $DEST/xample/public/js/temp.js
mv $DEST/xample/public/js/temp.js $DEST/xample/public/js/lg.js

cat $DEST/xample/public/js/bengine.js $DEST/xample/public/js/omni.js $DEST/xample/public/js/pl.js > $DEST/xample/public/js/temp.js
mv $DEST/xample/public/js/temp.js $DEST/xample/public/js/pl.js

cat $DEST/xample/public/js/omni.js $DEST/xample/public/js/nav.js > $DEST/xample/public/js/temp.js
mv $DEST/xample/public/js/temp.js $DEST/xample/public/js/nav.js

# remove unneeded files that were concatenated into others
rm $DEST/xample/public/js/bengine.js
rm $DEST/xample/public/js/omni.js
rm $DEST/xample/public/js/btemp.js
rm -rf $DEST/xample/public/js/blocks

# create minified versions of frontend js files
if [[ "$DENV" == "pro" || "$DENV" == "sta" ]]; then
        $DEST/xample/node_modules/uglify-js/bin/uglifyjs -mt -o $DEST/xample/public/js/bp.min.js $DEST/xample/public/js/bp.js
        $DEST/xample/node_modules/uglify-js/bin/uglifyjs -mt -o $DEST/xample/public/js/lg.min.js $DEST/xample/public/js/lg.js
        $DEST/xample/node_modules/uglify-js/bin/uglifyjs -mt -o $DEST/xample/public/js/pl.min.js $DEST/xample/public/js/pl.js
        $DEST/xample/node_modules/uglify-js/bin/uglifyjs -mt -o $DEST/xample/public/js/nav.min.js $DEST/xample/public/js/nav.js
fi

if [[ "$DENV" == "pro" ]]; then
    rm -f $DEST/xample/public/js/bp.js
    rm -f $DEST/xample/public/js/lg.js
    rm -f $DEST/xample/public/js/pl.js
    rm -f $DEST/xample/public/js/nav.js
fi

if [[ "$DENV" == "dev" ]]; then
    rm -f $DEST/xample/public/js/bp.min.js
    rm -f $DEST/xample/public/js/lg.min.js
    rm -f $DEST/xample/public/js/pl.min.js
    rm -f $DEST/xample/public/js/nav.min.js
fi

# install any remote archive files
if [[ "$INIT" == "yes" ]]; then
    wget http://104.131.155.58/pdfjs.tar.gz -P /var/www/wisepool/xample/public/js/
    wget http://104.131.155.58/pdfjs.tar.gz -P $DEST/xample/public/js/
    tar xvzf $DEST/xample/public/js/pdfjs.tar.gz  --strip 1
    rm $DEST/xample/public/js/pdfjs.tar.gz
    chown root:root pdf.min.js
    chown root:root pdf.min.worker.js
fi
