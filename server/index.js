import express from "express";
import pg from "pg";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

// Setting up __dirname and __filename for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Express application
const app = express();

// Middleware for JSON parsing and CORS handling
app.use(express.json());
app.use(cors({
  origin: "https://dny-keeper-app.vercel.app",  // Update this to your frontend URL
  methods: ["POST", "GET", "DELETE"],
  credentials: true
}));

// Load environment variables from .env file
dotenv.config();

// PostgreSQL client setup
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: { rejectUnauthorized: false }
});

// Connect to the PostgreSQL database
db.connect((err) => {
  if (err) {
    console.error("Failed to connect to PostgreSQL:", err);
  } else {
    console.log("Connected to PostgreSQL successfully");
  }
});

// Route for user signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *";
    const result = await db.query(insertQuery, [email, hashedPassword]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).json({ error: "Error signing up" });
  }
});

// Route for adding a note
app.post("/notes", async (req, res) => {
  const { email, title, content } = req.body;
  try {
    const insertQuery = "INSERT INTO notes (email, title, content) VALUES ($1, $2, $3) RETURNING *";
    const result = await db.query(insertQuery, [email, title, content]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving note:", err);
    res.status(500).json({ error: "Error saving note" });
  }
});

// Route for fetching notes based on email
app.get("/notes", async (req, res) => {
  const { email } = req.query;
  try {
    const fetchQuery = "SELECT * FROM notes WHERE email = $1";
    const result = await db.query(fetchQuery, [email]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Error fetching notes" });
  }
});

// Route for deleting a note
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = "DELETE FROM notes WHERE id = $1 RETURNING *";
    const result = await db.query(deleteQuery, [id]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Error deleting note" });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all route to serve React's index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server on the specified port
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
