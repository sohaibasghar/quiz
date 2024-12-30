const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const port = 3000;


// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Open a database connection
let db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create users table without email field
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    age INTEGER,
    gender TEXT,
    education TEXT,
    ethnicity TEXT,
    nationality TEXT,
    issue TEXT,
    religious_affiliation TEXT,
    lived_year INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.get('/health', (req, res) => {
  res.send('Hello World!');
})

// Endpoint to insert a new user
app.post('/users', (req, res) => {
  const { age, gender, education, ethnicity, nationality, issue, religious_affiliation, lived_year } = req.body;
  const id = uuidv4();
  db.run(`INSERT INTO users (id, age, gender, education, ethnicity, nationality, issue, religious_affiliation, lived_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [id, age, gender, education, ethnicity, nationality, issue, religious_affiliation, lived_year], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'User created', id: id });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});