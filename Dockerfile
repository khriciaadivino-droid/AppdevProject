# Node/Express API only — uses package.api.json (not the React Native package.json).
FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ libsqlite3-dev \
  && rm -rf /var/lib/apt/lists/*

COPY package.api.json ./package.json
RUN npm install --omit=dev \
  && npm rebuild sqlite3 --build-from-source

COPY server.js websocket.js db.js User.js DeviceToken.js authRoutes.js pushRoutes.js ./
COPY petRoutes.js Pet.js ./

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV SQLITE_STORAGE=/app/data/divino.db

EXPOSE 8080

CMD ["node", "server.js"]
