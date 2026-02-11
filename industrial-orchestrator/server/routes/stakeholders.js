const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all stakeholders with optional filters
// GET /api/stakeholders?role=Investor&search=John
router.get('/', verifyToken, (req, res) => {
    const { role, search } = req.query;
    let sql = `SELECT id, name, email, role, bio, contact, created_at FROM users WHERE 1=1`;
    const params = [];

    if (role) {
        sql += ` AND role = ?`;
        params.push(role);
    }

    if (search) {
        sql += ` AND (name LIKE ? OR bio LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Server error' });
        }
        res.json(rows);
    });
});

module.exports = router;
