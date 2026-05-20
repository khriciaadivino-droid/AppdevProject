const express = require('express');
const Order = require('./Order');
const Product = require('./Product');

const router = express.Router();

// Middleware to verify auth token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    next();
};

// GET all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: Product }],
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single order
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: Product }],
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE order
router.post('/orders', verifyToken, async (req, res) => {
    try {
        const { orderNumber, productId, customerName, customerEmail, quantity, totalAmount, status } = req.body;
        const order = await Order.create({
            orderNumber,
            productId,
            customerName,
            customerEmail,
            quantity,
            totalAmount,
            status,
        });
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE order
router.put('/orders/:id', verifyToken, async (req, res) => {
    try {
        const { orderNumber, productId, customerName, customerEmail, quantity, totalAmount, status } = req.body;
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        await order.update({
            orderNumber,
            productId,
            customerName,
            customerEmail,
            quantity,
            totalAmount,
            status,
        });
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE order
router.delete('/orders/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        await order.destroy();
        res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
