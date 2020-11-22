#!/bin/bash
npm install
cd ./player
npm install

cd ..
node ./cli/resetConfig.js

npm run build