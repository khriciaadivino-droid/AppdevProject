const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    authProvider: {
      type: DataTypes.ENUM('email', 'google'),
      allowNull: false,
      defaultValue: 'email',
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    photoURL: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      field: 'photo_url',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  }
);

module.exports = User;
