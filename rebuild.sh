#!/bin/bash
cd textile-graphql || exit
rm -f package-lock.json
npm i
npx tsc

cd textile-adapter || exit
rm -f package-lock.json
npm i
npx tsc

cd ../identity || exit
rm -f package-lock.json
npm i
npx tsc

cd ../circles || exit
rm -f package-lock.json
npm i
npx tsc

cd ../app || exit
rm -r -f node_modules/@omo
rm -f package-lock.json
npm i
npx tsc
