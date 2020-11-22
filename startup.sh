#!/bin/bash
node ./cli/init_file.js
node ./cli/bdd.js
node ./cli/resetConfig.js

cd ./player
npm run build

cd ..
node muffin.js