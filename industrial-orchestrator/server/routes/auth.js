const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { UserModel } = require('../models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

router.post('/register', (req, res) => {
    const { name, email, password, role, bio, contact } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    UserModel.findByEmail(email, (err, user) => {
        if (err) return res.status(500).send({ message: 'Server error' });
        if (user) return res.status(400).send({ message: 'Email already exists' });

        UserModel.create({ name, email, password, role, bio, contact }, (err, newUser) => {
            if (err) return res.status(500).send({ message: 'Error creating user' });

            const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
            res.status(201).send({ message: 'User registered successfully', token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
        });
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    UserModel.findByEmail(email, (err, user) => {
        if (err) return res.status(500).send({ message: 'Server error' });
        if (!user) return res.status(404).send({ message: 'User not found' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).send({ message: 'Server error' });
            if (!isMatch) return res.status(401).send({ message: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
            res.send({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    });
});

module.exports = router;
