const http = require('http');
const express = require('express');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initWebSocket } = require('./websocket');

const sequelize = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const mountRoute = routeFile => {
  const routePath = path.join(__dirname, routeFile);

  if (!fs.existsSync(routePath)) {
    console.warn(`⚠️ Skipping missing route module: ${routeFile}`);
    return;
  }

  try {
    app.use('/api', require(`./${routeFile}`));
  } catch (error) {
    console.warn(`⚠️ Skipping route module ${routeFile}: ${error.message}`);
  }
};

['authRoutes.js', 'pushRoutes.js', 'petRoutes.js', 'orderRoutes.js', 'categoryRoutes.js', 'productRoutes.js', 'stockRoutes.js']
  .forEach(mountRoute);

const PORT = Number(process.env.PORT) || 9000;

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Server listening on http://0.0.0.0:${PORT}`);
  console.log(`🟢 WebSocket at ws://0.0.0.0:${PORT}/ws`);
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log(`🟢 Database connected (${process.env.USE_MYSQL === 'true' ? 'MySQL' : 'SQLite'})`);
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
};

connectDatabase();
