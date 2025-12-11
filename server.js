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
// DEMO BACKEND FOR ALL INTERFACES (NO DATABASE)
// ======================================================

// Temporary in-memory users storage
let users = [
  {
    id: 1,
    name: "Demo User",
    email: "demo@ccsit.edu.sa",
    password: "123456",
    role: "student",
    studentId: "44123456",
    major: "Computer Science",
    level: 3
  }
];

// Helper functions
function getUserByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

function createUser(name, email, password, studentId, major, level) {
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: "student",
    studentId,
    major,
    level
  };
  users.push(newUser);
  return newUser;
}

// ======================================================
// API ENDPOINTS
// ======================================================

// 1️⃣ API للمجتمعات
app.get("/api/communities", (req, res) => {
  console.log("📚 Communities request received");
  const communities = [
    {
      id: "comm1",
      name: "Web Development Community",
      description: "Learn web development technologies",
      members: ["user1", "user2"],
      moderators: ["user1"],
      memberCount: 124,
      postCount: 8
    },
    {
      id: "comm2",
      name: "AI & Machine Learning",
      description: "Explore AI and ML concepts",
      members: ["user1", "user3"],
      moderators: ["user2"],
      memberCount: 89,
      postCount: 12
    }
  ];
  res.json(communities);
});

// 2️⃣ API لتسجيل الدخول
app.post("/api/login", (req, res) => {
  console.log("🔍 Login request received:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("❌ Missing email or password");
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // تحقق من صحة الإيميل (يجب أن يكون من ccsit.edu.sa)
  if (!email.endsWith("@ccsit.edu.sa")) {
    console.log("❌ Invalid email domain:", email);
    return res.status(401).json({ success: false, message: "INVALID" });
  }

  const user = getUserByEmail(email);

  if (!user || user.password !== password) {
    console.log("❌ Invalid credentials for:", email);
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  console.log(`✅ Login successful for: ${email} (User ID: ${user.id})`);
  res.json({
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      major: user.major,
      level: user.level
    }
  });
});

// 3️⃣ API للتسجيل
app.post("/api/signup", (req, res) => {
  console.log("📝 Signup request received:", req.body);

  const { fullName, studentId, major, level, email, password } = req.body;

  if (!fullName || !studentId || !major || !level || !email || !password) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // تحقق من صحة الإيميل (يجب أن يكون من ccsit.edu.sa)
  if (!email.endsWith("@ccsit.edu.sa")) {
    console.log("❌ Invalid email domain:", email);
    return res.status(400).json({ success: false, message: "Email must be from ccsit.edu.sa domain" });
  }

  if (password.length < 8) {
    console.log("❌ Password too short");
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  const existing = getUserByEmail(email);
  if (existing) {
    console.log("❌ User already exists");
    return res.status(409).json({ success: false, message: "User with this email already exists" });
  }

  const user = createUser(fullName, email, password, studentId, major, level);

  console.log(`✅ User registered successfully: ${email} (ID: ${user.id})`);
  res.json({
    success: true,
    message: "Account created successfully",
    userId: user.id
  });
});

// 4️⃣ API للبروفايل
app.get("/api/profile", (req, res) => {
  console.log("👤 Profile request received");
  const mockProfile = {
    id: 1,
    fullName: "Demo User",
    studentId: "44123456",
    major: "Computer Science",
    level: 3,
    email: "demo@ccsit.edu.sa",
    joinedDate: "2023-01-01",
    communities: ["comm1", "comm2"],
    role: "student"
  };
  res.json(mockProfile);
});

// 5️⃣ API للأدمن
app.get("/api/admin", (req, res) => {
  console.log("👑 Admin request received");
  const mockAdminData = {
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      studentId: u.studentId,
      major: u.major,
      level: u.level
    })),
    communities: [
      { id: "comm1", name: "Web Development", members: 124, type: "Academic" },
      { id: "comm2", name: "AI & ML", members: 89, type: "Academic" }
    ],
    totalUsers: users.length,
    totalCommunities: 2
  };
  res.json(mockAdminData);
});

// 6️⃣ API للخريطة
app.get("/api/map", (req, res) => {
  console.log("🗺️ Map request received");
  const mockMapData = {
    buildings: [
      { id: "b1", name: "Main Building", floors: 5, description: "Administrative offices" },
      { id: "b2", name: "CSIT Building", floors: 3, description: "Computer Science and IT departments" }
    ],
    locations: [
      { id: "l1", name: "Library", building: "b1", floor: 2 },
      { id: "l2", name: "Cafeteria", building: "b1", floor: 1 },
      { id: "l3", name: "Computer Lab", building: "b2", floor: 1 },
      { id: "l4", name: "Lecture Hall", building: "b2", floor: 2 }
    ]
  };
  res.json(mockMapData);
});

// 7️⃣ API للاختبار
app.get("/api/test", (req, res) => {
  console.log("🧪 Test endpoint called");
  res.json({
    message: "Server is running and responding",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/communities",
      "POST /api/login",
      "POST /api/signup",
      "GET /api/profile",
      "GET /api/admin",
      "GET /api/map",
      "GET /api/test",
      "POST /api/forgot-password"
    ]
  });
});

// 8️⃣ API لنسيان كلمة المرور
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required."
    });
  }

  console.log("📧 Forgot password request for:", email);
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
  console.log("Available endpoints:");
  console.log("  GET  /api/communities");
  console.log("  POST /api/login");
  console.log("  POST /api/signup");
  console.log("  GET  /api/profile");
  console.log("  GET  /api/admin");
  console.log("  GET  /api/map");
  console.log("  GET  /api/test");
  console.log("  POST /api/forgot-password");
});
