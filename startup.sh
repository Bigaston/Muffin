#!/bin/bash
node ./cli/init_file.js

npx sequelize-cli db:migrate --config ./models/config.js 

node ./cli/resetConfig.js

cd ./player
npm run build

cd ..
node muffin.js