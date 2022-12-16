FROM node:slim

WORKDIR /app

COPY package* /app/

RUN npm ci && \
  echo '{}' > menu.json && \
  chown -R node /app

COPY . /app/

USER node

CMD ["node", "index.js"]
