#!/bin/bash

cd $(pwd)/xample
tsc
npm install
cd ../public_html/js
tsc
