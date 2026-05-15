FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY server.js index.html manifest.json service-worker.js icon-192.png icon-512.png ./

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server.js"]
