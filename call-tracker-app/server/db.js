const sqlite3 = require('sqlite3').verbose();
let db;

function getDb() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
        } else {
            db = new sqlite3.Database('./jpec.sqlite', (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log("Connected to SQLite database.");
                    resolve(db);
                }
            });
        }
    });
}

module.exports = getDb;