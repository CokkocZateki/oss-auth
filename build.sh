cd /opt/auth/;
meteor build --server=https://auth.bos.gs:443 --directory ../auth.build/  --architecture os.linux.x86_64; 
cd /opt/auth.build/bundle/programs/server/; 
npm install; 
pm2 restart main; 
pm2 logs main