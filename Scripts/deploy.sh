#!/bin/bash
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v18.19.1/bin

 cd OnlineJudge
 git pull origin main
 npm install
 cd Backend/dist
 pm2 kill
 pm2 start index.js
 cd workers
 pm2 start index.js