const express = require('express');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const sequelize = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

['authRoutes.js', 'petRoutes.js', 'orderRoutes.js', 'categoryRoutes.js', 'productRoutes.js', 'stockRoutes.js']
  .forEach(mountRoute);

const PORT = process.env.PORT || 9000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('🟢 MySQL connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🟢 Server running on http://0.0.0.0:${PORT}`);
      console.log(`🟢 Access from other devices at: http://192.168.254.107:${PORT}`);
    });
  } catch (error) {
    console.error('MySQL connection error:', error);
    process.exit(1);
  }
};

startServer();
