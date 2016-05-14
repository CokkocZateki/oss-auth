#cd /opt/auth/;
current=`pwd`
meteor build --server=https://auth.bos.gs:443 --directory ../auth.build/  --architecture os.linux.x86_64; 
cd ../auth.build/bundle/programs/server/; 
npm install; 
cd ../../
pm2 delete main;
#export CLUSTER_WORKERS_COUNT=4 HTTP_FORWARDED_COUNT=1 MONGO_URL='mongodb://127.0.0.1/meteor' PORT='3000' ROOT_URL='https://auth.bos.gs' METEOR_SETTINGS=$(cat /opt/auth/settings_live.json) ; pm2 start main.js
export CLUSTER_WORKERS_COUNT=4 HTTP_FORWARDED_COUNT=1 MONGO_URL='mongodb://127.0.0.1/meteor' PORT='3000' ROOT_URL='https://auth.bos.gs' METEOR_SETTINGS=$(cat $current"/settings_live.json") ; pm2 start main.js 
#pm2 restart main; 
pm2 logs main