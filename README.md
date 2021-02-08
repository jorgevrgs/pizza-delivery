# Pizza API

An example of a Pizza Delivery API for educational purposes, not for use in production environments. No dependencies.

## Run

### Development

```
npm i -g nodemon
nodemon index.js
```

### Production

```
npm install pm2 -g
NODE_ENV=production pm2 start index.js
```

Managing processes:

```
pm2 restart app_name
pm2 reload app_name
pm2 stop app_name
pm2 delete app_name
```

Cluster mode:

```
pm2 start app.js -i max
```

Ecosystem File

```
pm2 ecosystem
pm2 start ecosystem.config.js
pm2 stop ecosystem.config.js
pm2 restart ecosystem.config.js
pm2 reload ecosystem.config.js
```

## Install

### SSL

```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

### Debug

```
NODE_DEBUG=workers node index.js
```
