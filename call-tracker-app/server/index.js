const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const TokenAuthentication = require('./TokenAuthentication');
// Other Routes
const authenticationRoutes = require('./authentication');

// Middleware
app.use(cors());
app.use(express.json()); // This will allow all domains to access the API

// Use Other Routes
app.use('/api', authenticationRoutes); //The three route problem still applies for this

/*

  CALL TABLE SECTION

*/
// Get all calls
app.get('/api/calls',TokenAuthentication.authenticateToken, (req, res) => {
    db.all('SELECT * FROM Calls', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get Unique Call Types
app.get('/api/callTypes', (req, res) => {
  db.all('SELECT DISTINCT call_type FROM Calls ', [], (err, rows) => {
    if (err) {
        res.status(400).json({ error: err.message });
        return;
    }
    console.log(rows);
    res.json({ data: rows });
  });
});

// Get a single call by ID
app.get('/api/calls/:id', TokenAuthentication.authenticateToken, (req, res) => {
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
app.get('/api/calls-by-type-and-time', TokenAuthentication.authenticateToken, (req, res) => {
    const { callType, time_dispatched, time_completed } = req.query;
    console.log(req.query);
    const sql = `
        SELECT * FROM Calls
        WHERE call_type = ?
        AND time_called BETWEEN ? AND ?
    `;

    const params = [callType, time_dispatched, time_completed];
   
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        console.log("rows:",rows);
        res.json({ data: rows });
    });
});
//get call by time
app.get('/api/calls-by-time', TokenAuthentication.authenticateToken, (req, res) => {
  const { time_dispatched, time_completed } = req.query;
  console.log("Received time range:", time_dispatched, time_completed);

  // SQL query to select calls by date range
  const sql = `
      SELECT * FROM Calls
      WHERE time_called BETWEEN ? AND ?
  `;
  const params = [time_dispatched, time_completed];

  // Execute the query
  db.all(sql, params, (err, rows) => {
      if (err) {
          console.log(rows, " error");
          res.status(400).json({ error: err.message }); // Send error response if query fails
          return;
      }
      console.log(rows, " data");
      res.json({ data: rows }); // Send the retrieved rows as response
  });
});

// get call by call_type
app.get('/api/calls-by-type', TokenAuthentication.authenticateToken, async (req, res) => {
  const { callType } = req.query; // Only get callType from query parameters
  // SQL query to select calls by call type
  const sql = `
      SELECT * FROM Calls
      WHERE call_type = ?
  `;
  const params = [callType];

  // Execute the query
  db.all(sql, params, (err, rows) => {  
      if (err) {
          res.status(400).json({ error: err.message }); // Send error response if query fails
          return;
      }
      res.json({ data: rows }); // Send the retrieved rows as response
  });

});
// Add a new call
app.post('/api/calls', TokenAuthentication.authenticateToken, async (req, res) => {
  try {
    const {
      caller_name,
      caller_address,
      call_type,
      crew_assigned,
      time_called,
      time_dispatched,
      time_completed,
      issue_reported,
      issue_found,
      dispatcher_id
    } = req.body;

    // Validate required fields
    if (!caller_name || !caller_address || !call_type) {
      return res.status(400).json({ error: 'caller_name, caller_address, and call_type are required fields.' });
    }

    const sql = `
      INSERT INTO Calls (
        caller_name, caller_address, call_type, crew_assigned,
        time_called, time_dispatched, time_completed, issue_reported,
        issue_found, dispatcher_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      caller_name,
      caller_address,
      call_type,
      crew_assigned || null, // Optional fields can be null if not provided
      time_called || new Date().toISOString(), // Default to current timestamp if not provided
      time_dispatched || null,
      time_completed || null,
      issue_reported || null,
      issue_found || null,
      dispatcher_id || null,
    ];

    db.run(sql, params, function (err) {
      if (err) {
        console.error('Error inserting call:', err.message);
        return res.status(500).json({ error: 'Failed to insert call into the database.' });
      }

      // Successful insert
      res.status(201).json({
        message: 'Call entry added successfully.',
        callId: this.lastID, // Retrieve the ID of the newly inserted row
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});


// Update a call entry by ID
app.put('/api/calls/:id', TokenAuthentication.authenticateToken, (req, res) => {
    const { id } = req.params;
    const {
      caller_name,
      caller_address,
      call_type,
      crew_assigned,
      time_called,
      time_dispatched,
      time_completed,
      issue_reported,
      dispatcher_id
    } = req.body;
  
    // SQL query to update the call entry
    const sql = `
      UPDATE calls 
      SET caller_name = ?, caller_address = ?, call_type = ?, crew_assigned = ?, 
          time_called = ?, time_dispatched = ?, time_completed = ?, 
          issue_reported = ?, dispatcher_id = ?
      WHERE id = ?`;
  
    const params = [
      caller_name, caller_address, call_type, crew_assigned, 
      time_called, time_dispatched, time_completed, 
      issue_reported, dispatcher_id, id
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

  app.delete('/api/calls/:id',TokenAuthentication.authenticateToken, (req, res) => {
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
app.post('/api/users', TokenAuthentication.authenticateToken, (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    const epassword = bcrypt.hash(password, 10);
    const params = [name, email, epassword, role];
    

    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID });
    });
  });

  // Get all users
  app.get('/api/users', TokenAuthentication.authenticateToken, (req, res) => {
    db.all('SELECT * FROM Users', [], (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ data: rows });
    });
  });

  // Get Users by Role
  app.get('/api/users-role', TokenAuthentication.authenticateToken, (req, res) => {
    const {role} = req.query;
    console.log("role received ", role)
    const sql = 'Select * FROM Users WHERE role = ?';
    const params = [role]
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      console.log("Data gotten by get users by role ", rows)
      res.json({ data: rows });
    });
  });
  
  // Get a single user by ID
  app.get('/api/users/:id', TokenAuthentication.authenticateToken, (req, res) => {
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
  app.put('/api/users/:id', TokenAuthentication.authenticateToken, async (req, res) => {
    if(req.user.role != 'manager'){
      return res.status(400).json({message: "Only managers can create new users"})
  }
    const { name, email, password, role } = req.body;

    const sql = `UPDATE Users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?`;

    const newpassword = await bcrypt.hash(password, 10);

    const params = [name, email, newpassword, role, req.params.id];
    console.log("req in update user by id", req);
    db.run(sql, params, function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ message: 'User updated successfully', changes: this.changes });
    });
  });
  
  // Delete a user by ID
  app.delete('/api/users/:id', TokenAuthentication.authenticateToken, (req, res) => {
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
app.post('/api/crews', TokenAuthentication.authenticateToken, (req, res) => {
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
  app.get('/api/crews', TokenAuthentication.authenticateToken, (req, res) => {
    db.all('SELECT * FROM Crews', [], (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ data: rows });
    });
  });
  
  // Get a single crew by ID
  app.get('/api/crews/:id', TokenAuthentication.authenticateToken, (req, res) => {
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
  app.put('/api/crews/:id', TokenAuthentication.authenticateToken, (req, res) => {
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
  app.delete('/api/crews/:id', TokenAuthentication.authenticateToken, (req, res) => {
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

