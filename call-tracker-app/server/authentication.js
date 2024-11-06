const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Middleware
app.use(cors());
app.use(express.json()); // This will allow all domains to access the API

const SECRET = 'your_secret_key'; // Replace with an environment variable in production

// Connect to existing SQLite database
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Could not connect to the database:', err.message);
    } else {
        console.log('Connected to the existing SQLite database.');
    }
});

// User Registration 
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate role
    if (!['dispatcher', 'manager'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const sql = `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    const params = [name, email, hashedPassword, role];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
});

//User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const sql = `SELECT * FROM Users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Example protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Welcome, your role is ${req.user.role}` });
});