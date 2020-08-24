#!/bin/bash
cd ../app || exit
rm -r -f dist
rm -r -f node_modules/@omo
rm -f package-lock.json
npm i
npx tsc
