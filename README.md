# Pizza API

An example of a Pizza Delivery API for educational purposes, not for use in production environments. No dependencies.

## Install

### SSL

```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

### Debug

```
NODE_DEBUG=server node index.js
```

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

## How to use

### Create a customer

Request:

```
POST https://localhost:3001/customers

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user02@example.com",
  "password": "abcd1234...",
  "tosAgreement": true
}
```

Response:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user02@example.com",
  "tosAgreement": true,
  "id": "dXNlcjAyQGV4YW1wbGUuY29t"
}
```

### Authenticate

Request:

```
POST https://localhost:3001/tokens

{
  "email": "user02@example.com",
  "password": "abcd1234..."
}
```

Response:

```json
{
  "token": "dXNlcjAyQGV4YW1wbGUuY29t.4cf6a2d2b514217c817d0a646745de1b.53186fffa16c1fc61f7d0ea64f0ffdd20070d1245ab585556e6c3a7934a9b899"
}
```

### Get menu

Request:

```
GET https://localhost:3001/menus
Authorization: Bearer dXNlcjAyQGV4YW1wbGUuY29t.4cf6a2d2b514217c817d0a646745de1b.53186fffa16c1fc61f7d0ea64f0ffdd20070d1245ab585556e6c3a7934a9b899

```

## Managing processes:

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
