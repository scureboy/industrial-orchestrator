const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initLocalDatabase();
    }
});

function initLocalDatabase() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            bio TEXT,
            contact TEXT,
            profile_details TEXT, -- JSON string for role-specific attributes
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating users table:", err);
        });

        // Interactions Table
        db.run(`CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            initiator_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            project_name TEXT NOT NULL,
            type TEXT NOT NULL, 
            status TEXT DEFAULT 'pending',
            details TEXT,
            steps_json TEXT, -- JSON array of steps
            current_step_index INTEGER DEFAULT 0,
            approvals_json TEXT, -- Track which party has approved current step
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (initiator_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating interactions table:", err);
        });

        // Documents Table
        db.run(`CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            interaction_id INTEGER NOT NULL,
            uploader_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (interaction_id) REFERENCES interactions(id),
            FOREIGN KEY (uploader_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating documents table:", err);
        });

        // Messages Table (Shared Chat)
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            interaction_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (interaction_id) REFERENCES interactions(id),
            FOREIGN KEY (sender_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating messages table:", err);
        });

        console.log("Database tables initialized.");

        // Migration: Add missing columns if they don't exist
        db.run("ALTER TABLE users ADD COLUMN profile_details TEXT", (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.log('Migration Note (Users):', err.message);
            }
        });

        db.run("ALTER TABLE interactions ADD COLUMN details TEXT", (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.log('Migration Note (Interactions):', err.message);
            }
        });

        db.run("ALTER TABLE interactions ADD COLUMN steps_json TEXT", (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.log('Migration Note (Steps):', err.message);
            }
        });

        db.run("ALTER TABLE interactions ADD COLUMN current_step_index INTEGER DEFAULT 0", (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.log('Migration Note (StepIndex):', err.message);
            }
        });

        db.run("ALTER TABLE interactions ADD COLUMN approvals_json TEXT", (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.log('Migration Note (Approvals):', err.message);
            }
        });
    });
}

module.exports = db;
