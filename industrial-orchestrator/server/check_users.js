const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, role FROM users', (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('--- USER LIST ---');
        console.log(JSON.stringify(rows, null, 2));
        console.log('-----------------');
    }
    db.close();
});
