// Browser / Frontend step of the reference architecture.
// Talks to API Gateway (window.API_BASE, set in config.js), which routes to
// the Lambda function in backend/app.py, which reads/writes DynamoDB.

document.getElementById("appTitle").textContent = window.APP_NAME || "CloudVidya Starter";
document.documentElement.style.setProperty("--accent", window.APP_THEME_COLOR || "#FF9900");

const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");
const submitBtn = document.getElementById("submitBtn");

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = kind || "";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadItems() {
  try {
    const res = await fetch(`${window.API_BASE}/items`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      listEl.innerHTML = "<p style='color:#6B7684;font-size:13px;'>No items yet — be the first to submit one!</p>";
      return;
    }
    listEl.innerHTML = data.items
      .map(
        (item) => `
        <div class="item">
          <div class="title">${escapeHtml(item.title)}</div>
          <div class="desc">${escapeHtml(item.description)}</div>
          <div class="meta">
            <span class="badge">${escapeHtml(item.category || "General")}</span>
            <span class="badge">${escapeHtml(item.status || "OPEN")}</span>
            ${item.location ? `<span class="badge">📍 ${escapeHtml(item.location)}</span>` : ""}
            ${item.participantName ? `<span class="badge">👤 ${escapeHtml(item.participantName)}</span>` : ""}
            <span>${new Date(item.createdAt).toLocaleString()}</span>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    listEl.innerHTML = "<p style='color:#B3261E;font-size:13px;'>Couldn't load items. Check API_BASE in config.js and the browser console.</p>";
    console.error(err);
  }
}

submitBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value.trim(); // LOCATION CATCH KARYU
  const participantName = document.getElementById("participantName").value.trim();

  // Location ne pan mandatory karyu
  if (!title || !description || !location) {
    setStatus("Please fill in title, description, and location.", "err");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Submitting…");

  try {
    const res = await fetch(`${window.API_BASE}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // LOCATION NE PAYLOAD MA ADD KARYU
      body: JSON.stringify({ title, description, category, location, participantName }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Submission failed.");
    }

    setStatus("Saved! Check the list below.", "ok");
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("location").value = ""; // FIELD CLEAR KARYU
    document.getElementById("participantName").value = "";
    loadItems();
  } catch (err) {
    setStatus(err.message || "Something went wrong.", "err");
    console.error(err);
  } finally {
    submitBtn.disabled = false;
  }
});

loadItems();