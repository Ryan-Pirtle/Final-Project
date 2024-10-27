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
    db.serialize(() => {
        // Insert example data into Users table
        db.run(`
            INSERT INTO Users (name, email, password, role)
            VALUES ('Alice Smith', 'alice@example.com', 'password123', 'dispatcher'),
                   ('Bob Johnson', 'bob@example.com', 'securepass456', 'manager'),
                   ('Charlie Brown', 'charlie@example.com', 'mypassword789', 'dispatcher')
        `);
    
        // Insert example data into Calls table
        db.run(`
            INSERT INTO Calls (customer_name, customer_address, call_type, crew_assigned, date_time_called, time_dispatched, time_completed, issue_reported, issue_found, dispatcher_id)
            VALUES ('John Doe', '123 Main St', 'Power Outage', 'Crew Alpha', '2023-10-25 22:00', '2023-10-25 22:15', '2023-10-25 23:30', 'No power since 10 PM', 'Tripped breaker', 1),
                   ('Jane Smith', '456 Oak Ave', 'Water Leak', 'Crew Beta', '2023-10-26 08:30', '2023-10-26 09:00', '2023-10-26 10:30', 'Water leaking in basement', 'Burst pipe', 2),
                   ('Tom Lee', '789 Pine Rd', 'Gas Leak', 'Crew Gamma', '2023-10-27 12:45', '2023-10-27 13:00', '2023-10-27 14:00', 'Smell of gas near stove', 'Loose valve', 1)
        `);
    
        // Insert example data into Crews table
        db.run(`
            INSERT INTO Crews (crew_name, crew_contact)
            VALUES ('Crew Alpha', '555-1234'),
                   ('Crew Beta', '555-5678'),
                   ('Crew Gamma', '555-9101')
        `);
    });

    console.log('Database and tables created successfully with sample data');
});

db.close();