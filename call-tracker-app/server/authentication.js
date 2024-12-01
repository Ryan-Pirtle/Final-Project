const express = require('express');
// const app = express();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db'); 
const router = express.Router();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const TokenAuthentication = require('./TokenAuthentication');

async function fetchProtectedData() {
    const token = localStorage.getItem("token");

    try {
        const response = await router.get("http://localhost:5000/api/protected", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Protected data:", response.data);
    } catch (error) {
        console.error("Error accessing protected route", error.response.data);
    }
}

// Test Route
router.get('/test', (req, res) => {
    db.all('select * from users', [], (err,rows) =>{
        if (err){
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows});
    })
})
// User Registration 
router.post('/register', TokenAuthentication.authenticateToken, async (req, res) => {
    const { name, email, password, role } = req.body;
    // console.log("req", req)
    console.log("req body", req.body);
    console.log("Role of person trying to create user ", req.user.role);

    if(req.user.role != 'manager'){
        return res.status(400).json({message: "Only managers can create new users"})
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user into the database
    const sql = `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    const params = [name, email, hashedPassword, role];
    // console.log("Params ",params );
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(400).json({ error: 'Email may already be in use', msg: err });
        }
        res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
});

//User Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Req.body1", req.body);
    // Find user by email
    const sql = `SELECT * FROM Users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Invalid email or password', err: err });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = TokenAuthentication.generateToken(user)
        console.log("token ", token);
        res.json({ message: 'Login successful', token });
    });
});

// Example protected route
router.get('/protected', TokenAuthentication.authenticateToken, (req, res) => {
    res.json({ message: `Welcome, your role is ${req.user.role}` });
});


module.exports = router;
