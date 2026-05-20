const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Product = require('./Product');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    productId: {
        type: DataTypes.UUID,
        references: {
            model: Product,
            key: 'id',
        },
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Processing', 'Completed', 'Cancelled'),
        defaultValue: 'Pending',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'orders',
    timestamps: true,
});

Order.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Order, { foreignKey: 'productId' });

module.exports = Order;
