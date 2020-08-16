#!/bin/bash
cd textile-adapter || exit
rm -r -f dist
rm -f package-lock.json
npm i
tsc

cd ../textile-graphql || exit
rm -r -f dist
rm -f package-lock.json
npm i
tsc

cd ../events || exit
rm -r -f dist
rm -f package-lock.json
npm i
tsc

cd ../identity || exit
rm -r -f dist
rm -f package-lock.json
npm i
tsc

cd ../circles || exit
rm -r -f dist
rm -f package-lock.json
npm i
tsc

cd ../app || exit
rm -r -f dist
rm -r -f node_modules/@omo
rm -f package-lock.json
npm i
tsc
