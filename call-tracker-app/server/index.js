const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

//Middleware
app.use(cors());
app.use(express.json());

//Database setup
const db = new sqlite3.Database('./jpec.sqlite', (err) => {
    if(err) {
        console.error('Error opening database:', err.nessage);
    }else{
        console.log("connected to sqlite database");
    }
});

// Example API endpoint to fetch calls
app.get('/api/calls', (req, res) => {
    db.all('SELECT * FROM calls', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get all calls
app.get('/api/calls', (req, res) => {
    db.all('SELECT * FROM Calls', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Add a new call
app.post('/api/calls', (req, res) => {
    const { customer_name, customer_address, call_type, crew_assigned, issue_reported } = req.body;
    db.run(`INSERT INTO Calls (customer_name, customer_address, call_type, crew_assigned, issue_reported) 
            VALUES (?, ?, ?, ?, ?)`,
            [customer_name, customer_address, call_type, crew_assigned, issue_reported], 
            function(err) {
                if (err) {
                    res.status(400).json({ error: err.message });
                    return;
                }
                res.status(201).json({ id: this.lastID });
            });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});