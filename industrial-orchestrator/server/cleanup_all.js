const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const uploadDir = path.join(__dirname, 'uploads');

const db = new sqlite3.Database(dbPath);

async function cleanup() {
    console.log('--- STARTING FINAL CLEANUP ---');

    // 1. Clear Database Tables
    const tables = ['messages', 'documents', 'interactions', 'users'];

    for (const table of tables) {
        await new Promise((resolve, reject) => {
            db.run(`DELETE FROM ${table}`, (err) => {
                if (err) {
                    console.error(`Error clearing ${table}:`, err.message);
                    resolve(); // Continue anyway
                } else {
                    console.log(`Cleared table: ${table}`);
                    resolve();
                }
            });
        });

        // Reset sequence
        await new Promise((resolve) => {
            db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`, () => resolve());
        });
    }

    // 2. Clear Uploads Folder
    if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        for (const file of files) {
            if (file !== '.gitkeep') {
                fs.unlinkSync(path.join(uploadDir, file));
                console.log(`Deleted file: ${file}`);
            }
        }
    }

    db.close(() => {
        console.log('--- CLEANUP COMPLETE ---');
        process.exit(0);
    });
}

cleanup();
