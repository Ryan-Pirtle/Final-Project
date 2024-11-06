const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Middleware
app.use(cors());
app.use(express.json()); // This will allow all domains to access the API