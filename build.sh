#!/bin/bash
npm install
cd ./player
npm install

cd ..
node ./cli/init_folder.js
node ./cli/bdd.js
node ./cli/resetConfig.js

npm run build