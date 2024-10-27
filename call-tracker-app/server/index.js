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
/*

  CALL TABLE SECTION

*/
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

// Get a single call by ID
app.get('/api/calls/:id', (req, res) => {
    const sql = 'SELECT * FROM Calls WHERE id = ?';
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ data: row });
    });
  });

// Get all calls by call type and date range
app.get('/api/calls/by-type-and-date', (req, res) => {
    const { callType, startDate, endDate } = req.query;

    const sql = `
        SELECT * FROM Calls
        WHERE call_type = ?
        AND date_time_called BETWEEN ? AND ?
    `;
    const params = [callType, startDate, endDate];

    db.all(sql, params, (err, rows) => {
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

// Update a call entry by ID
app.put('/api/calls/:id', (req, res) => {
    const { id } = req.params;
    const {
      caller_name,
      caller_address,
      call_type,
      crew_assigned,
      time_called,
      time_sent,
      time_completed,
      issue_reported,
      dispatcher
    } = req.body;
  
    // SQL query to update the call entry
    const sql = `
      UPDATE calls 
      SET caller_name = ?, caller_address = ?, call_type = ?, crew_assigned = ?, 
          time_called = ?, time_sent = ?, time_completed = ?, 
          issue_reported = ?, dispatcher = ?
      WHERE id = ?`;
  
    const params = [
      caller_name, caller_address, call_type, crew_assigned, 
      time_called, time_sent, time_completed, 
      issue_reported, dispatcher, id
    ];
  
    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Call not found' });
      } else {
        res.json({ message: 'Call entry updated successfully', changes: this.changes });
      }
    });
  });

  app.delete('/api/calls/:id', (req, res) => {
    const { id } = req.params;
  
    // SQL query to delete the call entry
    const sql = `DELETE FROM calls WHERE id = ?`;
  
    db.run(sql, id, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Call not found' });
      } else {
        res.json({ message: 'Call entry deleted successfully', changes: this.changes });
      }
    });
  });

  /*

  USER TABLE SECTION

  */

  // Create a new user
app.post('/api/users', (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    const params = [name, email, password, role];
    
    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID });
    });
  });
  
  // Get all users
  app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM Users', [], (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ data: rows });
    });
  });
  
  // Get a single user by ID
  app.get('/api/users/:id', (req, res) => {
    const sql = 'SELECT * FROM Users WHERE id = ?';
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ data: row });
    });
  });
  
  // Update a user by ID
  app.put('/api/users/:id', (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = `UPDATE Users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?`;
    const params = [name, email, password, role, req.params.id];
  
    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: 'User updated successfully', changes: this.changes });
    });
  });
  
  // Delete a user by ID
  app.delete('/api/users/:id', (req, res) => {
    const sql = 'DELETE FROM Users WHERE id = ?';
    const params = [req.params.id];
  
    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: 'User deleted successfully', changes: this.changes });
    });
  });

/*

  CREW TABLE SECTION

*/

// Create a new crew
app.post('/api/crews', (req, res) => {
    const { crew_name, crew_contact } = req.body;
    const sql = `INSERT INTO Crews (crew_name, crew_contact) VALUES (?, ?)`;
    const params = [crew_name, crew_contact];
    
    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID });
    });
  });
  
  // Get all crews
  app.get('/api/crews', (req, res) => {
    db.all('SELECT * FROM Crews', [], (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ data: rows });
    });
  });
  
  // Get a single crew by ID
  app.get('/api/crews/:id', (req, res) => {
    const sql = 'SELECT * FROM Crews WHERE id = ?';
    const params = [req.params.id];
    
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ data: row });
    });
  });
  
  // Update a crew by ID
  app.put('/api/crews/:id', (req, res) => {
    const { crew_name, crew_contact } = req.body;
    const sql = `UPDATE Crews SET crew_name = ?, crew_contact = ? WHERE id = ?`;
    const params = [crew_name, crew_contact, req.params.id];
  
    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: 'Crew updated successfully', changes: this.changes });
    });
  });
  
  // Delete a crew by ID
  app.delete('/api/crews/:id', (req, res) => {
    const sql = 'DELETE FROM Crews WHERE id = ?';
    const params = [req.params.id];
  
    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: 'Crew deleted successfully', changes: this.changes });
    });
  });

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});