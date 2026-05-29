const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const DeviceToken = sequelize.define(
  'DeviceToken',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    platform: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'unknown',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_seen_at',
    },
  },
  {
    tableName: 'device_tokens',
    underscored: true,
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { unique: true, fields: ['token'] },
    ],
  }
);

module.exports = DeviceToken;

