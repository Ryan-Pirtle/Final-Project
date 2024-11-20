// db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./jpec.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database');
    }
});

module.exports = db;  // Export the database instance for use in other files