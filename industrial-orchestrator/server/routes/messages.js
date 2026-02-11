const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get messages for an interaction
router.get('/interaction/:id', verifyToken, (req, res) => {
    const interaction_id = req.params.id;
    const sql = `
        SELECT m.*, u.name as sender_name 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE m.interaction_id = ? 
        ORDER BY m.created_at ASC
    `;
    db.all(sql, [interaction_id], (err, rows) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(rows);
    });
});

// Post a new message
router.post('/', verifyToken, (req, res) => {
    const { interaction_id, text } = req.body;
    const sender_id = req.userId;

    console.log(`[ChatMessage] Received: interaction=${interaction_id}, sender=${sender_id}, text="${text}"`);

    if (!interaction_id || !text) {
        return res.status(400).json({ message: 'Missing interaction_id or text' });
    }

    const sql = `INSERT INTO messages (interaction_id, sender_id, text) VALUES (?, ?, ?)`;
    db.run(sql, [interaction_id, sender_id, text], function (err) {
        if (err) {
            console.error('Error saving message:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({
            id: this.lastID,
            interaction_id,
            sender_id,
            text,
            created_at: new Date()
        });
    });
});

module.exports = router;
