const express = require('express');
const Pet = require('./Pet');

const router = express.Router();

// Middleware to verify auth token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    next();
};

// GET all pets
router.get('/pets', async (req, res) => {
    try {
        const pets = await Pet.findAll();
        res.json({ success: true, data: pets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single pet
router.get('/pets/:id', async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        res.json({ success: true, data: pet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE pet
router.post('/pets', verifyToken, async (req, res) => {
    try {
        const { name, species, breed, age, ownerName, description, image, isPetOfTheMonth } = req.body;
        const pet = await Pet.create({
            name,
            species,
            breed,
            age,
            ownerName,
            description,
            image,
            isPetOfTheMonth,
        });
        res.status(201).json({ success: true, data: pet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE pet
router.put('/pets/:id', verifyToken, async (req, res) => {
    try {
        const { name, species, breed, age, ownerName, description, image, isPetOfTheMonth } = req.body;
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        await pet.update({
            name,
            species,
            breed,
            age,
            ownerName,
            description,
            image,
            isPetOfTheMonth,
        });
        res.json({ success: true, data: pet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE pet
router.delete('/pets/:id', verifyToken, async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        await pet.destroy();
        res.json({ success: true, message: 'Pet deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
