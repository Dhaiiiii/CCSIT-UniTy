const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 3️⃣ API تجيب بيانات المجتمعات (بيانات تجريبية)
app.get("/api/communities", (req, res) => {
  const communities = [
    {
      id: "comm1",
      name: "Web Development Community",
      description: "Learn web development technologies",
      members: ["user1", "user2"],
      moderators: ["user1"]
    },
    {
      id: "comm2",
      name: "AI & Machine Learning",
      description: "Explore AI and ML concepts",
      members: ["user1", "user3"],
      moderators: ["user2"]
    }
  ];
  res.json(communities);
});

// 4️⃣ API لتسجيل الدخول
app.post("/api/login", (req, res) => {
  console.log("🔍 Login request received:", req.body);

  const { email, password } = req.body;

  // تحقق بسيط للديمو
  if (!email || !password) {
    console.log("❌ Missing email or password");
    return res.status(400).json({ message: "Email and password are required" });
  }

  // تحقق من صحة الإيميل (يجب أن يكون من ccsit.edu.sa)
  if (!email.endsWith("@ccsit.edu.sa")) {
    console.log("❌ Invalid email domain:", email);
    return res.status(401).json({ message: "INVALID" });
  }

  // Mock user data for demo
  const mockUser = {
    id: 1,
    full_name: "Demo User",
    student_id: "44123456",
    major: "Computer Science",
    level: 3,
    email: email
  };

  // تسجيل الدخول (mock)
  const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  console.log("📝 Logging login (mock):", { email, ipAddress, userAgent });

  console.log(`✅ Login successful for: ${email} (User ID: ${mockUser.id})`);
  res.json({
    message: "SUCCESS",
    user: {
      id: mockUser.id,
      fullName: mockUser.full_name,
      studentId: mockUser.student_id,
      major: mockUser.major,
      level: mockUser.level,
      email: email
    }
  });
});

// 5️⃣ API للتسجيل (إنشاء حساب جديد)
app.post("/api/signup", (req, res) => {
  console.log("📝 Signup request received:", req.body);

  const { fullName, studentId, major, level, email, password } = req.body;

  // تحقق من صحة البيانات
  if (!fullName || !studentId || !major || !level || !email || !password) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  // تحقق من صحة الإيميل (يجب أن يكون من ccsit.edu.sa)
  if (!email.endsWith("@ccsit.edu.sa")) {
    console.log("❌ Invalid email domain:", email);
    return res.status(400).json({ message: "Email must be from ccsit.edu.sa domain" });
  }

  // تحقق من طول كلمة المرور
  if (password.length < 8) {
    console.log("❌ Password too short");
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  // Mock signup - always success for demo
  console.log(`✅ User registered successfully: ${email} (Mock ID: 1)`);
  res.json({ message: "SUCCESS", userId: 1 });
});

// 6️⃣ API للاختبار
app.get("/api/test", (req, res) => {
  console.log("🧪 Test endpoint called");
  res.json({ message: "Server is running and responding", timestamp: new Date().toISOString() });
});

// 7️⃣ API للبروفايل
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
    communities: ["comm1", "comm2"]
  };
  res.json(mockProfile);
});

// 8️⃣ API للأدمن
app.get("/api/admin", (req, res) => {
  console.log("👑 Admin request received");
  const mockAdminData = {
    users: [
      { id: 1, name: "Demo User", email: "demo@ccsit.edu.sa", role: "student" }
    ],
    communities: [
      { id: "comm1", name: "Web Development", members: 2 },
      { id: "comm2", name: "AI & ML", members: 2 }
    ],
    totalUsers: 1,
    totalCommunities: 2
  };
  res.json(mockAdminData);
});

// 9️⃣ API للخريطة
app.get("/api/map", (req, res) => {
  console.log("🗺️ Map request received");
  const mockMapData = {
    buildings: [
      { id: "b1", name: "Main Building", floors: 5, description: "Administrative offices" },
      { id: "b2", name: "CSIT Building", floors: 3, description: "Computer Science and IT departments" }
    ],
    locations: [
      { id: "l1", name: "Library", building: "b1", floor: 2 },
      { id: "l2", name: "Cafeteria", building: "b1", floor: 1 }
    ]
  };
  res.json(mockMapData);
});

// 4️⃣ تشغيل السيرفر
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
