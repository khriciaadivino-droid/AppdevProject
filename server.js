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

const healthPayload = () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
});

app.get('/api/health', (_req, res) => {
  res.status(200).json(healthPayload());
});

app.get('/health', (_req, res) => {
  res.status(200).json(healthPayload());
});

app.get('/', (_req, res) => {
  res.status(200).json({ ...healthPayload(), service: 'divino-api' });
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

  if (routeFile === 'orderRoutes.js' && !fs.existsSync(path.join(__dirname, 'Product.js'))) {
    console.warn('⚠️ Skipping orderRoutes.js (Product.js not in deployment)');
    return;
  }

  try {
    app.use('/api', require(`./${routeFile}`));
  } catch (error) {
    console.warn(`⚠️ Skipping route module ${routeFile}: ${error.message}`);
  }
};

fs.readdirSync(__dirname)
  .filter(name => name.endsWith('Routes.js'))
  .sort()
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
    const syncOptions =
      process.env.SEQUELIZE_SYNC_ALTER === 'true' ? { alter: true } : {};
    await sequelize.sync(syncOptions);
    const dialect = sequelize.getDialect();
    console.log(`🟢 Database connected (${dialect})`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (error.message?.includes('BLOB/TEXT') && error.message?.includes('token')) {
      console.error(
        '💡 Drop the device_tokens table once in MySQL, then redeploy (schema was created with TEXT token).'
      );
    }
  }
};

connectDatabase();
