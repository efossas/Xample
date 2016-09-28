#!/bin/bash

cd $(pwd)/xample
rm -rf *.js
rm -rf typings/globals

cd ../public_html
rm -rf bower_components

cd js/
rm -rf *.js
