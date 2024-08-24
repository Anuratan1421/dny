import express from "express";
import pg from "pg";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import crypto from 'crypto';

const app = express();
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS for cross-origin requests
dotenv.config();

// PostgreSQL client setup
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
      rejectUnauthorized: false
  }
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Failed to connect to PostgreSQL:", err);
  } else {
    console.log("Connected to PostgreSQL successfully");
  }
});

// Encryption and Decryption setup
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Ensure the key is 32 bytes for AES-256
const IV_LENGTH = 16;

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}

// Routes
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (checkUser.rows.length > 0) {
      return res.json({ success: false, message: "User already exists." });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const result = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    res.json({ success: true, message: "User registered successfully!" });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ success: false, message: "An error occurred during signup." });
  }
});

// Login route
app.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the user by email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;

      // Verifying the password
      bcrypt.compare(password, storedHashedPassword, (err, isMatch) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).json({ success: false, message: "An error occurred during login." });
        }

        if (isMatch) {
          res.json({ success: true, message: "Login successful!" });
        } else {
          res.json({ success: false, message: "Incorrect password." });
        }
      });
    } else {
      res.json({ success: false, message: "User not found. Please register first." });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, message: "An error occurred during login." });
  }
});

// POST route to insert a note
app.post("/notes", async (req, res) => {
  const { email, title, content } = req.body;

  if (!email) {
    return res.status(400).send("Email is required.");
  }

  try {
    // Check if the email exists in the users table
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).send("User with the given email does not exist.");
    }

    // Encrypt the title and content
    const encryptedTitle = encrypt(title || '');
    const encryptedContent = encrypt(content || '');

    // Insert the note
    const query = "INSERT INTO notes (email, title, content) VALUES ($1, $2, $3)";
    await db.query(query, [email, encryptedTitle, encryptedContent]);

    res.status(201).send("Note added successfully");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error handling request");
  }
});

// GET route to fetch notes by user email
app.get("/notes", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send("Email is required.");
  }

  try {
    const query = "SELECT * FROM notes WHERE email = $1";
    const result = await db.query(query, [email]);

    // Decrypt the title and content before sending it to the client
    const notes = result.rows.map(note => ({
      ...note,
      title: decrypt(note.title),
      content: decrypt(note.content)
    }));

    res.status(200).json(notes);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error fetching notes");
  }
});

// DELETE route for notes
app.delete("/notes", async (req, res) => {
  const { title, content, email } = req.body;

  try {
    let query = "DELETE FROM notes WHERE email = $1";
    let queryParams = [email];
    
    if (title && content) {
      query += " AND title = $2 AND content = $3";
      queryParams.push(encrypt(title), encrypt(content));
    } else if (title) {
      query += " AND title = $2";
      queryParams.push(encrypt(title));
    } else if (content) {
      query += " AND content = $2";
      queryParams.push(encrypt(content));
    }

    const result = await db.query(query, queryParams);

    if (result.rowCount > 0) {
      res.status(200).send("Note deleted successfully");
    } else {
      res.status(404).send("Note not found or user not authorized");
    }
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).send("Error deleting note");
  }
});

// Export the server as a serverless function
export default app;