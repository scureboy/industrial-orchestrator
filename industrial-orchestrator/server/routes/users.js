const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get current user profile (detailed)
router.get('/profile', verifyToken, (req, res) => {
    const userId = req.userId;
    const sql = `SELECT id, name, email, role, bio, contact, profile_details FROM users WHERE id = ?`;

    db.get(sql, [userId], (err, row) => {
        if (err) return res.status(500).send({ message: 'Server error' });
        if (!row) return res.status(404).send({ message: 'User not found' });

        // Parse profile_details if it's a string
        if (row.profile_details && typeof row.profile_details === 'string') {
            try {
                row.profile_details = JSON.parse(row.profile_details);
            } catch (e) {
                row.profile_details = {};
            }
        }

        res.json(row);
    });
});

// Update current user profile
router.patch('/profile', verifyToken, (req, res) => {
    const userId = req.userId;
    const { bio, contact, profile_details } = req.body;

    const detailsJson = profile_details ? JSON.stringify(profile_details) : null;

    const sql = `UPDATE users SET bio = ?, contact = ?, profile_details = ? WHERE id = ?`;

    db.run(sql, [bio, contact, detailsJson, userId], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error updating profile' });
        }
        res.json({ message: 'Profile updated successfully' });
    });
});

// Get specific user profile (public view)
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    console.log(`[DEBUG] Fetching user profile for ID: ${id}`);

    const sql = `SELECT id, name, email, role, bio, contact, profile_details FROM users WHERE id = ?`;

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('[DEBUG] DB Error:', err);
            return res.status(500).send({ message: 'Server error' });
        }
        if (!row) {
            console.log(`[DEBUG] User not found for ID: ${id}`);
            return res.status(404).send({ message: 'User not found' });
        }

        if (row.profile_details && typeof row.profile_details === 'string') {
            try {
                row.profile_details = JSON.parse(row.profile_details);
            } catch (e) {
                row.profile_details = {};
            }
        }

        res.json(row);
    });
});

module.exports = router;
