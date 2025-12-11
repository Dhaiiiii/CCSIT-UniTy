console.log("✅ server.js file loaded");

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ======================================================
// MIDDLEWARES
// ======================================================
app.use(cors());
app.use(express.json());


// ======================================================
// EXISTING COMMUNITY SYSTEM (UNCHANGED)
// ======================================================

let communities = [
  {
    id: "comm-1",
    name: "Web Development Community",
    description: "Discuss front-end, back-end, frameworks, and projects.",
    type: "Academic",
    memberCount: 124,
    postCount: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "comm-2",
    name: "AI & Machine Learning",
    description: "Share AI ideas, datasets, models, and research.",
    type: "Academic",
    memberCount: 89,
    postCount: 12,
    createdAt: new Date().toISOString(),
  },
];

// GET all communities
app.get("/api/communities", (req, res) => {
  res.json(communities);
});

// GET single community
app.get("/api/communities/:id", (req, res) => {
  const community = communities.find((c) => c.id === req.params.id);
  if (!community) return res.status(404).json({ message: "Not found" });
  res.json(community);
});


// ======================================================
// AUTHENTICATION SYSTEM (ADDED BY YOU)
// ======================================================

// Temporary in-memory users (NO DATABASE)
let users = [
  {
    id: 1,
    name: "Demo User",
    email: "example@ccsit.edu.sa",
    password: "123456",
    role: "student"
  }
];

// Helper: find user by email
function getUserByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

// Helper: create new user
function createUser(name, email, password) {
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: "student"
  };
  users.push(newUser);
  return newUser;
}


// ------------------- SIGNUP -------------------
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required."
    });
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "This email is already registered."
    });
  }

  const user = createUser(name, email, password);

  return res.json({
    success: true,
    message: "Account created successfully.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});


// ------------------- LOGIN -------------------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required."
    });
  }

  const user = getUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  return res.json({
    success: true,
    message: "Login successful.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});


// ------------------- FORGOT PASSWORD -------------------
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required."
    });
  }

  // We pretend the email was sent (this is normal for prototypes)
  return res.json({
    success: true,
    message: "If this email is registered, a reset link has been sent."
  });
});


// ======================================================
// START SERVER
// ======================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
