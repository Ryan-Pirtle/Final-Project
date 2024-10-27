const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./jpec.sqlite');

db.serialize(() => {
    // Create Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('dispatcher', 'manager')) NOT NULL
        )
    `, (err) => {
        if (err) console.error('Error creating Users table:', err.message);
    });

    // Create Calls table
    db.run(`
        CREATE TABLE IF NOT EXISTS Calls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_address TEXT NOT NULL,
            call_type TEXT NOT NULL,
            crew_assigned TEXT,
            date_time_called DATETIME DEFAULT CURRENT_TIMESTAMP,
            time_dispatched DATETIME,
            time_completed DATETIME,
            issue_reported TEXT,
            issue_found TEXT,
            dispatcher_id INTEGER,
            FOREIGN KEY (dispatcher_id) REFERENCES Users(id)
        )
    `, (err) => {
        if (err) console.error('Error creating Calls table:', err.message);
    });

    // Create Crews table
    db.run(`
        CREATE TABLE IF NOT EXISTS Crews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crew_name TEXT NOT NULL,
            crew_contact TEXT
        )
    `, (err) => {
        if (err) console.error('Error creating Crews table:', err.message);
    });

    // Insert a sample call
    db.run(`
        INSERT INTO Calls (customer_name, customer_address, call_type, issue_reported)
        VALUES ('John Doe', '123 Main St', 'Power Outage', 'No power since 10 PM')
    `);

    console.log('Database and tables created successfully with sample data');
});

db.close();