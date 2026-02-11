const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database');
const verifyToken = require('../middleware/auth');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// List documents for user
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;
    const sql = `
        SELECT d.*, u.name as uploader_name 
        FROM documents d
        JOIN users u ON d.uploader_id = u.id
        WHERE d.uploader_id = ? OR d.interaction_id IN (
            SELECT id FROM interactions WHERE initiator_id = ? OR receiver_id = ?
        )
        ORDER BY d.created_at DESC
    `;
    db.all(sql, [userId, userId, userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Server error' });
        }
        res.json(rows);
    });
});

// Upload document with custom error handling
const uploadMiddleware = upload.any();

router.post('/', verifyToken, (req, res) => {
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error(`[MulterError] ${err.code}: ${err.field || err.message}`);
            return res.status(400).send({ message: `Upload error: ${err.message} (${err.field || ''})` });
        } else if (err) {
            console.error(`[UploadError] ${err.message}`);
            return res.status(500).send({ message: 'Unknown upload error' });
        }

        const uploader_id = req.userId;
        const { interaction_id, name } = req.body;

        // Grab the first file regardless of field name
        const file = req.files && req.files.length > 0 ? req.files[0] : null;
        const intId = Number(interaction_id);

        console.log(`[DocumentUpload] Received request: interaction_id=${interaction_id}, name=${name}, file_field=${file?.fieldname}`);

        if (!file) {
            console.error('[DocumentUpload] No file received. Fields received:', Object.keys(req.body));
            return res.status(400).send({ message: 'No file uploaded.' });
        }

        if (isNaN(intId)) {
            console.error(`[DocumentUpload] Invalid interaction_id: ${interaction_id}`);
            return res.status(400).send({ message: 'Invalid interaction ID' });
        }

        const docName = name || file.originalname;
        console.log(`Attempting document insert: interaction=${intId}, uploader=${uploader_id}, name=${docName}, file=${file.filename}`);

        const sql = `INSERT INTO documents (interaction_id, uploader_id, name, path) VALUES (?, ?, ?, ?)`;
        db.run(sql, [intId, uploader_id, docName, file.filename], function (err) {
            if (err) {
                console.error('DB Insert Error:', err);
                return res.status(500).send({ message: 'Error saving document info' });
            }
            console.log(`Document uploaded for interaction ${interaction_id}: ${docName}`);
            res.status(201).json({ id: this.lastID, message: 'Document uploaded', file: file.filename });
        });
    });
});

// Get documents for specific interaction
router.get('/interaction/:id', verifyToken, (req, res) => {
    const interactionId = Number(req.params.id);
    console.log(`Fetching documents for interaction: ${interactionId}`);

    const sql = `
        SELECT d.*, u.name as uploader_name 
        FROM documents d
        JOIN users u ON d.uploader_id = u.id
        WHERE d.interaction_id = ?
        ORDER BY d.created_at DESC
    `;
    db.all(sql, [interactionId], (err, rows) => {
        if (err) {
            console.error('DB Fetch Error:', err);
            return res.status(500).send({ message: 'Server error' });
        }
        console.log(`Found ${rows.length} documents for interaction ${interactionId}`);
        res.json(rows);
    });
});

module.exports = router;
