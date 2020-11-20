#!/bin/bash
node ./cli/env.js
node ./cli/resetConfig.js

cd ./player
npm run build

cd ..
node muffin.js