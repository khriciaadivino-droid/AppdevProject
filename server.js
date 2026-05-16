const express = require('express');
require('dotenv').config();

const sequelize = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const authRoutes = require('./authRoutes');
app.use('/api', authRoutes);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('MySQL connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MySQL connection error:', error);
    process.exit(1);
  }
};

startServer();
