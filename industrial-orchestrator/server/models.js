const db = require('./database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const UserModel = {
    create: (user, callback) => {
        bcrypt.hash(user.password, SALT_ROUNDS, (err, hash) => {
            if (err) return callback(err);
            const sql = `INSERT INTO users (name, email, password, role, bio, contact) VALUES (?, ?, ?, ?, ?, ?)`;
            const params = [user.name, user.email, hash, user.role, user.bio, user.contact];
            db.run(sql, params, function (err) {
                callback(err, { id: this.lastID, ...user });
            });
        });
    },

    findByEmail: (email, callback) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.get(sql, [email], (err, row) => {
            callback(err, row);
        });
    },

    findById: (id, callback) => {
        const sql = `SELECT id, name, email, role, bio, contact, created_at FROM users WHERE id = ?`;
        db.get(sql, [id], (err, row) => {
            callback(err, row);
        });
    }
};

module.exports = { UserModel };
