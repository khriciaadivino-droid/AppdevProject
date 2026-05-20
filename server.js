const express = require('express');
require('dotenv').config();
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

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const petRoutes = require('./petRoutes');
const orderRoutes = require('./orderRoutes');
const stockRoutes = require('./stockRoutes');

app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', petRoutes);
app.use('/api', orderRoutes);
app.use('/api', stockRoutes);

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
