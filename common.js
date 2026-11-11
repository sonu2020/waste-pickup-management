// Get all bookings from the browser storage
function getBookings() {
  return JSON.parse(localStorage.getItem("bookings")) || [];
}

// Save all bookings to the browser storage
function saveBookings(list) {
  localStorage.setItem("bookings", JSON.stringify(list));
}

// Makes text safe to show on a page
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Turns 2026-11-20 into 20/11/2026
function formatDate(text) {
  const parts = text.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

// Today's date in the format the date box uses
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// A colored label for the status
function statusBadge(status) {
  return `<span class="status status-${status}">${status}</span>`;
}
