# Node/Express API for Railway (Option A). Do not use the Symfony PHP Dockerfile.
FROM node:20-bookworm-slim

WORKDIR /app

# Native deps to compile sqlite3 for Debian bookworm (glibc 2.36), not host prebuilds
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ libsqlite3-dev \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
  && npm rebuild sqlite3 --build-from-source

COPY server.js websocket.js db.js User.js DeviceToken.js authRoutes.js pushRoutes.js ./
COPY petRoutes.js orderRoutes.js Pet.js Order.js ./

ENV NODE_ENV=production

CMD ["node", "server.js"]
