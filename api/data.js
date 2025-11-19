const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");


// In-memory database
const data = [
  { id: 1, firstname: "Tim", surname: "Berners-Lee" },
  { id: 2, firstname: "Roy", surname: "Fielding" }
];
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, "SECRET_KEY", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}



// GET /data - return all data
router.get("/", (req, res) => {
  res.status(200).json(data);
});

// GET /data/:id - return by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = data.find(d => d.id === id);
  if (!item) return res.status(404).json({ error: `Data with id ${id} not found` });
  res.status(200).json(item);
});

// POST /data - create new entry
router.post("/", (req, res) => {
  if (!req.is("application/json")) return res.status(415).json({ error: "Unsupported Media Type" });

  const { firstname, surname } = req.body;
  if (!firstname || !surname) return res.status(400).json({ error: "firstname and surname are required" });

  const id = data.length ? data[data.length - 1].id + 1 : 1;
  const newEntry = { id, firstname, surname };
  data.push(newEntry);

  res.status(201).json(newEntry);
});

// PUT /data/:id - update or create
router.put("/:id", (req, res) => {
  if (!req.is("application/json")) return res.status(415).json({ error: "Unsupported Media Type" });

  const id = parseInt(req.params.id);
  const { firstname, surname } = req.body;
  if (!firstname || !surname) return res.status(400).json({ error: "firstname and surname are required" });

  const index = data.findIndex(d => d.id === id);
  if (index === -1) {
    const newEntry = { id, firstname, surname };
    data.push(newEntry);
    return res.status(201).json(newEntry);
  }

  data[index] = { id, firstname, surname };
  res.status(200).json(data[index]);
});

// DELETE /data/:id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = data.findIndex(d => d.id === id);
  if (index === -1) return res.status(404).json({ error: `Data with id ${id} not found` });

  const deleted = data.splice(index, 1)[0];
  res.status(200).json(deleted);
});

// POST /data/search - search by firstname
router.post("/search", (req, res) => {
  if (!req.is("application/json")) return res.status(415).json({ error: "Unsupported Media Type" });

  const { firstname } = req.body;
  if (!firstname) return res.status(400).json({ error: "firstname is required" });

  const results = data.filter(d => d.firstname.toLowerCase() === firstname.toLowerCase());
  if (results.length === 0) return res.status(404).json({ error: "User not found" });

  res.status(200).json(results);
});

module.exports = {
  router,       // your router
  verifyToken,  // the middleware function
  data          // optional if needed
};
