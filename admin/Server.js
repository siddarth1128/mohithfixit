require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); 

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Bhavani@123",
  database: process.env.DB_NAME || "fixitnow_2",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper: query with promise
function query(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Admin registration endpoint
// Requires body: { name, email, password, adminSecret }
// adminSecret must match process.env.ADMIN_SECRET
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;
    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json({ message: "All fields required (name,email,password,adminSecret)." });
    }
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid admin secret — registration denied." });
    }

    // Check if email exists
    const existing = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    await query("INSERT INTO users (name,email,password,role) VALUES (?, ?, ?, 'admin')", [name, email, hashed]);
    res.json({ message: "Admin registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// Admin login endpoint
// Accepts { email, password }
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required." });

    const rows = await query("SELECT id, name, email, password, role FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ message: "Invalid credentials." });

    const user = rows[0];

    // Role-based restriction: only admins allowed
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials." });

    // For demonstration we'll just return a success + minimal profile.
    // In production you should create a session or JWT and use HTTPS.
    res.json({
      message: "Login successful.",
      admin: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Simple protected admin-only route example
app.get("/admin/dashboard", async (req, res) => {
  // In a real app you'd check a session or JWT.
  res.json({ message: "This is a placeholder admin dashboard endpoint (requires auth in real app)." });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));