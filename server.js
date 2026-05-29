const http = require('http');
const express = require('express');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initWebSocket } = require('./websocket');

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection:', reason);
});
process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

const app = express();
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const healthPayload = () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
});

app.get('/api/health', (_req, res) => {
  let db = 'unknown';
  try {
    db = require('./db').getDialect();
  } catch {
    /* db not ready */
  }
  res.status(200).json({ ...healthPayload(), db });
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

const connectDatabase = async () => {
  const sequelize = require('./db');

  try {
    await sequelize.authenticate();

    if (process.env.DROP_DEVICE_TOKENS_TABLE === 'true') {
      await sequelize.query('DROP TABLE IF EXISTS device_tokens');
      console.log('✅ Dropped device_tokens (DROP_DEVICE_TOKENS_TABLE=true)');
    }

    const syncOptions =
      process.env.SEQUELIZE_SYNC_ALTER === 'true' ? { alter: true } : {};
    await sequelize.sync(syncOptions);
    console.log(`🟢 Database connected (${sequelize.getDialect()})`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (error.message?.includes('BLOB/TEXT') && error.message?.includes('token')) {
      console.error(
        '💡 Run: DROP TABLE IF EXISTS device_tokens; then redeploy.'
      );
    }
  }
};

server.on('error', error => {
  console.error('🔴 HTTP server error:', error.message);
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Server listening on http://0.0.0.0:${PORT} (PORT=${process.env.PORT})`);
  console.log(`🟢 Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`🟢 WebSocket at ws://0.0.0.0:${PORT}/ws`);
  connectDatabase().catch(err => console.error('Database setup failed:', err.message));
});
