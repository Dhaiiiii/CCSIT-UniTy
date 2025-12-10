console.log("✅ server.js file loaded");

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Temporary data
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
