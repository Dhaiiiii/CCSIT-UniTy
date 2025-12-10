// عناصر الواجهة
const aiWidget = document.getElementById("ai-assistant-widget");
const aiToggleBtn = document.getElementById("ai-toggle-button");
const aiCloseBtn = document.getElementById("ai-close-button");

const messagesEl = document.getElementById("ai-messages");
const form = document.getElementById("ai-chat-form");
const questionInput = document.getElementById("ai-question-input");
const sendBtn = document.getElementById("ai-send-btn");

// نفتح/نقفل الودجت
if (aiToggleBtn) {
  aiToggleBtn.addEventListener("click", () => {
    aiWidget.classList.toggle("open");
    if (aiWidget.classList.contains("open")) {
      questionInput.focus();
    }
  });
}

if (aiCloseBtn) {
  aiCloseBtn.addEventListener("click", () => {
    aiWidget.classList.remove("open");
  });
}

// تاريخ المحادثة
const chatHistory = [];

// إضافة رسالة عادية
function addMessage(text, sender = "user") {
  const div = document.createElement("div");
  div.classList.add("ai-msg", sender);
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

// رد الـ AI
function addAIResponse(text) {
  return addMessage(text, "ai");
}

// استدعاء الـ API تبع بايثون (نفس اللي عندك في app.py)
async function sendToAI(question, history) {
  const res = await fetch("http://127.0.0.1:5000/api/ask-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return await res.json();
}

// أول رسالة ترحيب
addAIResponse("مرحباً 👋 أنا مساعد CCSIT UniTy. اسألي عن الجامعة، الكلية، الجداول، التدريب، والأنظمة.");

// عند إرسال الفورم
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const q = questionInput.value.trim();
  if (!q) return;

  addMessage(q, "user");
  chatHistory.push({ role: "user", content: q });

  questionInput.value = "";
  sendBtn.disabled = true;

  const thinkingMsg = addAIResponse("جاري التفكير...");

  try {
    const data = await sendToAI(q, chatHistory);

    // نحذف "جاري التفكير"
    if (thinkingMsg && thinkingMsg.parentNode) {
      thinkingMsg.parentNode.removeChild(thinkingMsg);
    }

    addAIResponse(data.answer || "تم 😊");
    chatHistory.push({ role: "assistant", content: data.answer });
  } catch (err) {
    console.error(err);
    if (thinkingMsg && thinkingMsg.parentNode) {
      thinkingMsg.parentNode.removeChild(thinkingMsg);
    }
    addAIResponse("عذراً، حدث خطأ في الاتصال بالخادم.");
  }

  sendBtn.disabled = false;
});
