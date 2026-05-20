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
      field: 'full_name',
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
    roles: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '["ROLE_USER"]',
      get() {
        const rawValue = this.getDataValue('roles');
        if (!rawValue) {
          return ['ROLE_USER'];
        }

        try {
          return Array.isArray(rawValue) ? rawValue : JSON.parse(rawValue);
        } catch (_error) {
          return [String(rawValue)];
        }
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('roles', JSON.stringify(value));
          return;
        }

        this.setDataValue('roles', value || '["ROLE_USER"]');
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
  },
  {
    tableName: 'user',
    underscored: true,
    timestamps: false,
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
