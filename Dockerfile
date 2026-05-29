# Node/Express API for Railway (Option A). Do not use the Symfony PHP Dockerfile.
FROM node:20-bookworm-slim

WORKDIR /app

# Native deps for sqlite3
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js websocket.js db.js User.js DeviceToken.js authRoutes.js pushRoutes.js ./
COPY petRoutes.js orderRoutes.js Pet.js Order.js ./

ENV NODE_ENV=production

CMD ["node", "server.js"]
