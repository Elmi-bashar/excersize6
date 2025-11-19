const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");

// Dummy user for demo
const users = [
  { id: 1, username: "admin", passwordHash: bcrypt.hashSync("password123", 10) }
];

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per IP
  message: { error: "Too many login attempts, please try again later." }
});

// POST /login
router.post("/", loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Create JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, "SECRET_KEY", {
    expiresIn: "1h"
  });

  res.status(200).json({ token });
});

module.exports = router;
