const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');
const router = express.Router();

const { INTERACTION_STEPS } = require('../constants/interactionSteps');

// Create new interaction
router.post('/', verifyToken, (req, res) => {
    const { receiver_id, project_name, type, details } = req.body;
    const initiator_id = req.userId;

    if (!receiver_id || !project_name || !type) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    const steps = INTERACTION_STEPS[type] || ['Started', 'Review', 'Completed'];
    const stepsJson = JSON.stringify(steps);
    const detailsJson = details ? JSON.stringify(details) : null;
    const approvalsJson = JSON.stringify({}); // Empty approvals object

    const sql = `INSERT INTO interactions (initiator_id, receiver_id, project_name, type, status, details, steps_json, current_step_index, approvals_json) VALUES (?, ?, ?, ?, 'pending', ?, ?, 0, ?)`;
    db.run(sql, [initiator_id, receiver_id, project_name, type, detailsJson, stepsJson, approvalsJson], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error creating interaction' });
        }
        res.status(201).json({ id: this.lastID, message: 'Interaction started' });
    });
});

// Get interactions for current user
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;
    const sql = `
        SELECT 
            i.*, 
            init.name as initiator_name, init.role as initiator_role,
            rec.name as receiver_name, rec.role as receiver_role
        FROM interactions i
        JOIN users init ON i.initiator_id = init.id
        JOIN users rec ON i.receiver_id = rec.id
        WHERE i.initiator_id = ? OR i.receiver_id = ?
        ORDER BY i.updated_at DESC
    `;

    db.all(sql, [userId, userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Server error' });
        }
        // Parse JSON fields
        const processedRows = rows.map(row => ({
            ...row,
            steps_json: row.steps_json ? JSON.parse(row.steps_json) : [],
            approvals_json: row.approvals_json ? JSON.parse(row.approvals_json) : {},
            details: row.details ? JSON.parse(row.details) : {}
        }));
        res.json(processedRows);
    });
});

// Get single interaction
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            i.*, 
            init.name as initiator_name, init.role as initiator_role,
            rec.name as receiver_name, rec.role as receiver_role
        FROM interactions i
        JOIN users init ON i.initiator_id = init.id
        JOIN users rec ON i.receiver_id = rec.id
        WHERE i.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).send({ message: 'Server error' });
        if (!row) return res.status(404).send({ message: 'Interaction not found' });

        res.json({
            ...row,
            steps_json: row.steps_json ? JSON.parse(row.steps_json) : [],
            approvals_json: row.approvals_json ? JSON.parse(row.approvals_json) : {},
            details: row.details ? JSON.parse(row.details) : {}
        });
    });
});

// Approve current step
router.patch('/:id/approve-step', verifyToken, (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    db.get('SELECT * FROM interactions WHERE id = ?', [id], (err, interaction) => {
        if (err || !interaction) return res.status(404).send({ message: 'Not found' });

        const approvals = interaction.approvals_json ? JSON.parse(interaction.approvals_json) : {};
        const steps = interaction.steps_json ? JSON.parse(interaction.steps_json) : [];
        let currentIndex = interaction.current_step_index;

        // Record current user's approval
        approvals[userId] = true;

        // Check if both initiator and receiver have approved
        const bothApproved = approvals[interaction.initiator_id] && approvals[interaction.receiver_id];

        let sql = `UPDATE interactions SET approvals_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        let params = [JSON.stringify(approvals), id];

        if (bothApproved) {
            // Advance step
            currentIndex += 1;
            const newStatus = currentIndex >= steps.length ? 'completed' : 'pending';

            sql = `UPDATE interactions SET approvals_json = ?, current_step_index = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            params = [JSON.stringify({}), currentIndex, newStatus, id]; // Reset approvals for next step
        }

        db.run(sql, params, function (err) {
            if (err) return res.status(500).send({ message: 'Error updating approval' });
            res.json({ message: bothApproved ? 'Step completed and advanced' : 'Approval recorded', advanced: bothApproved });
        });
    });
});

module.exports = router;
