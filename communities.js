document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".communities-grid");
  if (!container) return;

  // مبدئياً نعطي رسالة تحميل
  container.innerHTML = `
    <p style="color:#a9b4c2;font-size:.9rem;">
      Loading communities from server...
    </p>
  `;

  try {
    const res = await fetch("http://localhost:3000/api/communities");
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();

    // لو مافيه بيانات
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `
        <p style="color:#a9b4c2;font-size:.9rem;">
          No communities found yet. Try adding some rows in the database.
        </p>
      `;
      return;
    }

    // نمسح المحتوى القديم
    container.innerHTML = "";

    data.forEach((comm) => {
      const card = document.createElement("article");
      card.className = "community-card";

      const typeLabel = comm.type || "General";
      const members = comm.member_count ?? comm.memberCount ?? 0;
      const threads = comm.thread_count ?? comm.postCount ?? 0;

      card.innerHTML = `
        <div class="community-name">${comm.name}</div>
        <div class="community-meta">
          ${members} members · ${threads} active threads · 
          <span class="pill">${typeLabel}</span>
        </div>
        <p class="community-description">
          ${comm.description || "No description provided yet for this community."}
        </p>
        <div class="card-footer">
          <a href="#" class="link">View community →</a>
          <button class="btn btn-primary">Join</button>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading communities:", err);
    container.innerHTML = `
      <p style="color:#fca5a5;font-size:.9rem;">
        Failed to load communities from server. Please check that:
        <br>- server.js is running
        <br>- Database name is correct
        <br>- Table "communities" has data
      </p>
    `;
  }
});
