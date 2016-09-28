#!/bin/bash

npm install typescript -g
npm install typings -g

cd $(pwd)/xample
typings install
tsc
npm install

cd ../public_html
bower install

if [ ! -f ./js/alertify.min.js ]; then
  cp bower_components/alertify/alertify.min.js ./js
fi

if [ ! -f ./js/pdf.combined.js ]; then
  cp bower_components/pdfjs-dist/build/pdf.combined.js ./js
fi

if [ ! -f ./js/highlight.pack.min.js ]; then
  cp bower_components/highlighjs/highlight.pack.min.js ./js
fi

if [ ! -f ./js/es6-promise.min.js ]; then
  cp bower_components/pdfjs-dist/build/es6-promise.min.js ./js
fi

if [ ! -f ./js/MathJax.js ]; then
  cp bower_components/pdfjs-dist/build/MathJax.js ./js
fi

cd js
typings install
tsc
